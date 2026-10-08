import type {
  ManagedNotificationCreatedDto,
  ManagedNotificationDetailsDto,
  ManagedNotificationInputDto,
  ManagedNotificationPageDto,
  ManagedNotificationAudienceDto,
  NotificationListDto,
} from '@traderlab/contracts';
import type {
  NotificationIdentityDirectory,
  NotificationListFilter,
  NotificationRepository,
} from '../domain/Notification.js';
import { NotificationError } from '../domain/NotificationError.js';

const maximumPageSize = 50;
const adminPageSize = 20;
const recipientPageSize = 25;

export class NotificationService {
  constructor(
    private readonly repository: NotificationRepository,
    private readonly identities: NotificationIdentityDirectory,
  ) {}

  async listForAdmin(pageInput: number): Promise<ManagedNotificationPageDto> {
    const page = Math.max(1, Math.floor(pageInput));
    const { items, totalItems } = await this.repository.listForAdmin({
      offset: (page - 1) * adminPageSize,
      limit: adminPageSize,
    });
    return {
      items: items.map((item) => this.toManagedDto(item)),
      page,
      pageSize: adminPageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / adminPageSize),
    };
  }

  async getAdminDetails(
    notificationId: number,
    pageInput: number,
  ): Promise<ManagedNotificationDetailsDto> {
    const page = Math.max(1, Math.floor(pageInput));
    const notification = await this.repository.findForAdmin(notificationId);
    if (!notification) {
      throw new NotificationError('Notificação não encontrada.', 404);
    }
    const recipients = await this.repository.listRecipients({
      notificationId,
      offset: (page - 1) * recipientPageSize,
      limit: recipientPageSize,
    });
    const legacyIds = recipients
      .filter((recipient) => recipient.email === null)
      .map((recipient) => recipient.userId);
    const legacyEmails = new Map<string, string>();
    if (legacyIds.length > 0) {
      try {
        const identities = await this.identities.listAll();
        const wanted = new Set(legacyIds);
        for (const identity of identities) {
          if (wanted.has(identity.id) && identity.email) {
            legacyEmails.set(identity.id, identity.email);
          }
        }
      } catch {
        // Historical delivery details remain useful if the identity provider is unavailable.
      }
    }
    const totalPages = Math.ceil(notification.recipientCount / recipientPageSize);
    return {
      ...this.toManagedDto(notification),
      recipients: recipients.map((recipient) => ({
        name: recipient.name,
        email: recipient.email ?? legacyEmails.get(recipient.userId) ?? null,
        sentAt: recipient.sentAt.toISOString(),
      })),
      recipientPage: page,
      recipientPageSize,
      totalRecipients: notification.recipientCount,
      totalRecipientPages: totalPages,
    };
  }

  listCourses() {
    return this.repository.listCourses();
  }

  async createAndSend(
    input: ManagedNotificationInputDto,
    administratorId: string,
  ): Promise<ManagedNotificationCreatedDto> {
    const title = input.title.trim();
    const description = input.description.trim();
    if (!title || title.length > 180) {
      throw new NotificationError('Informe um título de até 180 caracteres.', 400);
    }
    if (!description || description.length > 3000) {
      throw new NotificationError('Informe uma descrição de até 3.000 caracteres.', 400);
    }

    const linkUrl = this.normalizeLink(input.linkUrl);
    const audience = input.audience === 'general' ? 'GENERAL' : 'COURSE';
    const courseId = input.courseId ?? null;
    if (audience === 'GENERAL' && courseId !== null) {
      throw new NotificationError('O público geral não deve ter um curso associado.', 400);
    }
    if (audience === 'COURSE') {
      if (!Number.isSafeInteger(courseId) || courseId === null || courseId < 1) {
        throw new NotificationError('Selecione um curso publicado.', 400);
      }
      const courses = await this.repository.listCourses();
      if (!courses.some((course) => course.id === courseId)) {
        throw new NotificationError('O curso selecionado não existe.', 400);
      }
    }

    const candidateIds = await this.repository.listRecipientCandidateIds({
      audience,
      courseId,
    });
    const uniqueCandidateIds = [...new Set(candidateIds)];
    if (uniqueCandidateIds.length === 0) {
      throw new NotificationError(
        audience === 'GENERAL'
          ? 'Nenhum usuário cadastrado foi encontrado para receber esta notificação.'
          : 'Nenhum usuário com matrícula ativa foi encontrado neste curso.',
        422,
      );
    }
    const identities = await this.identities.listAll();
    const identitiesById = new Map(identities.map((identity) => [identity.id, identity]));
    const recipients = uniqueCandidateIds.flatMap((userId) => {
      const identity = identitiesById.get(userId);
      return identity ? [{ userId, email: identity.email }] : [];
    });
    if (recipients.length === 0) {
      throw new NotificationError(
        'Não foi possível associar os usuários encontrados a uma identidade da plataforma.',
        422,
      );
    }

    const result = await this.repository.createPublished({
      title,
      description,
      linkUrl,
      audience,
      courseId,
      createdById: administratorId,
      recipients,
    });
    return {
      id: result.id,
      sentAt: result.sentAt.toISOString(),
      recipientCount: result.recipientCount,
    };
  }

  private normalizeLink(value?: string | null): string | null {
    let link = value?.trim() ?? '';
    if (!link) return null;
    if (/^www\./i.test(link)) {
      link = `https://${link}`;
    }
    if (link.length > 2048) {
      throw new NotificationError('O link deve ter até 2.048 caracteres.', 400);
    }
    if (link.startsWith('/') && !link.startsWith('//') && !link.includes('\\')) {
      return link;
    }
    try {
      const parsed = new URL(link);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return link;
    } catch {
      // Report a domain validation message below.
    }
    throw new NotificationError('Informe um link HTTP ou HTTPS válido.', 400);
  }

  private toManagedDto(record: Awaited<ReturnType<NotificationRepository['findForAdmin']>> & {}) {
    if (!record) throw new NotificationError('Notificação não encontrada.', 404);
    return {
      id: record.id,
      title: record.title,
      description: record.description,
      linkUrl: record.linkUrl,
      audience: record.audience.toLowerCase() as ManagedNotificationAudienceDto,
      courseId: record.courseId,
      courseTitle: record.courseTitle,
      sentAt: record.sentAt.toISOString(),
      recipientCount: record.recipientCount,
    };
  }

  async listForUser(input: {
    userId: string;
    filter: NotificationListFilter;
    offset: number;
    limit: number;
  }): Promise<NotificationListDto> {
    const offset = Math.max(0, Math.floor(input.offset));
    const limit = Math.min(
      maximumPageSize,
      Math.max(1, Math.floor(input.limit)),
    );
    const [pageRecords, unreadCount] = await Promise.all([
      this.repository.listForUser({ ...input, offset, limit: limit + 1 }),
      this.repository.countUnread(input.userId),
    ]);
    const hasMore = pageRecords.length > limit;
    const records = pageRecords.slice(0, limit);
    const items = records.map((record) => ({
      id: record.id,
      title: record.title,
      description: record.description,
      linkUrl: record.linkUrl,
      audience: record.audience.toLowerCase() as 'general' | 'course',
      courseId: record.courseId,
      courseTitle: record.courseTitle,
      sentAt: record.sentAt.toISOString(),
      readAt: record.readAt?.toISOString() ?? null,
    }));

    return {
      items,
      unreadCount,
      nextOffset: hasMore ? offset + records.length : null,
    };
  }

  updateReadState(input: {
    userId: string;
    notificationId: number;
    isRead: boolean;
  }) {
    return this.repository.updateReadState(input);
  }

  markAllAsRead(userId: string) {
    return this.repository.markAllAsRead(userId);
  }
}
