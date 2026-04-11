import Image from "next/image";

/** Картинка товара: локальные пути через next/image, внешние URL — через img (любой домен из админки). */
export function SafeImage(props: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
}) {
  if (!props.src) {
    return <div className={props.className} />;
  }
  const isLocal = props.src.startsWith("/");
  const fillClass = props.fill ? "absolute inset-0 h-full w-full object-cover" : "";

  if (isLocal) {
    return (
      <Image
        src={props.src}
        alt={props.alt}
        fill={props.fill}
        className={props.className}
        sizes={props.sizes}
        priority={props.priority}
        /* загрузки в /uploads — без оптимизатора, чтобы не ловить кэш /_next/image на проде */
        unoptimized={props.src.startsWith("/uploads/")}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={props.src}
      alt={props.alt}
      className={[fillClass, props.className].filter(Boolean).join(" ")}
    />
  );
}
