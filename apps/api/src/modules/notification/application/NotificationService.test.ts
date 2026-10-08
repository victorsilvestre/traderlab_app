import { describe, expect, it, vi } from 'vitest';
import type {
  NotificationIdentityDirectory,
  NotificationRepository,
} from '../domain/Notification.js';
import { NotificationService } from './NotificationService.js';

describe('NotificationService.getAdminDetails', () => {
  it('keeps historical recipient details available when identity lookup fails', async () => {
    const sentAt = new Date('2026-10-08T12:00:00.000Z');
    const repository = {
      findForAdmin: vi.fn().mockResolvedValue({
        id: 4,
        title: 'Aviso de teste',
        description: 'Mensagem de teste',
        linkUrl: null,
        audience: 'GENERAL',
        courseId: null,
        courseTitle: null,
        sentAt,
        recipientCount: 1,
      }),
      listRecipients: vi.fn().mockResolvedValue([
        {
          userId: 'student-1',
          name: 'Aluna de teste',
          email: null,
          sentAt,
        },
      ]),
    } as unknown as NotificationRepository;
    const identities: NotificationIdentityDirectory = {
      listAll: vi.fn().mockRejectedValue(new Error('Identity provider unavailable')),
    };
    const service = new NotificationService(repository, identities);

    const details = await service.getAdminDetails(4, 1);

    expect(details.recipients).toEqual([
      {
        name: 'Aluna de teste',
        email: null,
        sentAt: sentAt.toISOString(),
      },
    ]);
  });

  it('uses the saved recipient email without querying the identity provider', async () => {
    const sentAt = new Date('2026-10-08T12:00:00.000Z');
    const repository = {
      findForAdmin: vi.fn().mockResolvedValue({
        id: 5,
        title: 'Aviso de teste',
        description: 'Mensagem de teste',
        linkUrl: null,
        audience: 'GENERAL',
        courseId: null,
        courseTitle: null,
        sentAt,
        recipientCount: 1,
      }),
      listRecipients: vi.fn().mockResolvedValue([
        {
          userId: 'student-1',
          name: 'Aluna de teste',
          email: 'student@example.com',
          sentAt,
        },
      ]),
    } as unknown as NotificationRepository;
    const identities: NotificationIdentityDirectory = {
      listAll: vi.fn(),
    };
    const service = new NotificationService(repository, identities);

    const details = await service.getAdminDetails(5, 1);

    expect(identities.listAll).not.toHaveBeenCalled();
    expect(details.recipients[0]?.email).toBe('student@example.com');
  });
});

describe('NotificationService.createAndSend', () => {
  it('explains when the general audience has no registered users', async () => {
    const repository = {
      listRecipientCandidateIds: vi.fn().mockResolvedValue([]),
    } as unknown as NotificationRepository;
    const identities: NotificationIdentityDirectory = {
      listAll: vi.fn(),
    };
    const service = new NotificationService(repository, identities);

    await expect(
      service.createAndSend(
        {
          title: 'Aviso de teste',
          description: 'Mensagem de teste',
          linkUrl: null,
          audience: 'general',
          courseId: null,
        },
        'administrator-1',
      ),
    ).rejects.toMatchObject({
      message:
        'Nenhum usuário cadastrado foi encontrado para receber esta notificação.',
      statusCode: 422,
    });
    expect(identities.listAll).not.toHaveBeenCalled();
  });

  it.each([
    ['www.exemplo.com.br/aula', 'https://www.exemplo.com.br/aula'],
    ['https://exemplo.com.br/aula', 'https://exemplo.com.br/aula'],
  ])(
    'includes registered users and normalizes %s',
    async (linkUrl, expectedLinkUrl) => {
      const sentAt = new Date('2026-10-08T12:00:00.000Z');
      const repository = {
        listRecipientCandidateIds: vi.fn().mockResolvedValue(['student-1']),
        createPublished: vi.fn().mockResolvedValue({
          id: 12,
          sentAt,
          recipientCount: 1,
        }),
      } as unknown as NotificationRepository;
      const identities: NotificationIdentityDirectory = {
        listAll: vi.fn().mockResolvedValue([
          {
            id: 'student-1',
            email: 'student@example.com',
          },
        ]),
      };
      const service = new NotificationService(repository, identities);

      await service.createAndSend(
        {
          title: 'Aviso de teste',
          description: 'Mensagem de teste',
          linkUrl,
          audience: 'general',
          courseId: null,
        },
        'administrator-1',
      );

      expect(repository.createPublished).toHaveBeenCalledWith(
        expect.objectContaining({
          linkUrl: expectedLinkUrl,
          recipients: [{ userId: 'student-1', email: 'student@example.com' }],
        }),
      );
    },
  );
});
