import styles from './StudentHome.module.css';

export function homeClass(
  ...classNames: Array<string | false | null | undefined>
) {
  return classNames
    .filter((className): className is string => Boolean(className))
    .map((className) => styles[className] ?? className)
    .filter(Boolean)
    .join(' ');
}
