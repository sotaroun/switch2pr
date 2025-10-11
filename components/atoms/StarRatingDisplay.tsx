import { Box, HStack, Text } from "@chakra-ui/react";
import type { HStackProps } from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";

const STAR_MASK_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='white' d='M23.555 8.729a1.5 1.5 0 0 0-1.407-.98H16.062a.5.5 0 0 1-.472-.334L13.405 1.222a1.5 1.5 0 0 0-2.81 0l-.005.016L8.41 7.415a.5.5 0 0 1-.471.334H1.85A1.5 1.5 0 0 0 .887 10.4l5.184 4.3a.5.5 0 0 1 .155.543L4.048 21.774a1.5 1.5 0 0 0 2.31 1.684l5.346-3.92a.5.5 0 0 1 .591 0l5.344 3.919a1.5 1.5 0 0 0 2.312-1.683l-2.178-6.535a.5.5 0 0 1 .155-.543l5.194-4.306a1.5 1.5 0 0 0-.068-2.778Z'/%3E%3C/svg%3E\")";

export type RatingStarsProps = {
  value?: number;
  defaultValue?: number;
  max?: number;
  precision?: 1 | 0.5 | 0.25;
  readOnly?: boolean;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  activeColor?: string;
  idleColor?: string;
  onChange?: (value: number) => void;
  ariaLabel?: string;
};

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const snap = (n: number, step: number) => Math.round(n / step) * step;

export const RatingStars = ({
  value,
  defaultValue = 0,
  max = 5,
  precision = 0.5,
  readOnly = true,
  showValue = false,
  size = "md",
  activeColor = "#ffd966",
  idleColor,
  onChange,
  ariaLabel = "rating",
}: RatingStarsProps) => {
  const [inner, setInner] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? (value as number) : inner;

  const resolvedIdle = idleColor ?? `rgba(255, 217, 102, ${0.35})`;
  const boxSize = useMemo(() => {
    if (size === "sm") return 4;
    if (size === "lg") return 6;
    return 5;
  }, [size]);

  const commit = useCallback(
    (next: number) => {
      if (!controlled) setInner(next);
      onChange?.(next);
    },
    [controlled, onChange]
  );

  const handleClick = useCallback(
    (index: number, event: React.MouseEvent<HTMLDivElement>) => {
      if (readOnly) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      const stepped = snap(ratio, precision);
      const next = clamp(index - 1 + stepped, 0, max);
      commit(Number(next.toFixed(2)));
    },
    [commit, max, precision, readOnly]
  );

  const handleKey = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (readOnly) return;
      const step = precision;
      let next = current;
      if (event.key === "ArrowRight") next = clamp(current + step, 0, max);
      if (event.key === "ArrowLeft") next = clamp(current - step, 0, max);
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = max;
      if (next !== current) {
        event.preventDefault();
        commit(Number(next.toFixed(2)));
      }
    },
    [commit, current, max, precision, readOnly]
  );

  return (
    <HStack
      as="span"
      spacing={1}
      role={readOnly ? "img" : "slider"}
      aria-label={ariaLabel}
      aria-valuemin={readOnly ? undefined : 0}
      aria-valuemax={readOnly ? undefined : max}
      aria-valuenow={readOnly ? undefined : Number(current.toFixed(1))}
      tabIndex={readOnly ? -1 : 0}
      onKeyDown={handleKey}
    >
      {Array.from({ length: max }).map((_, index) => {
        const fill = clamp(current - index, 0, 1);
        const percent = `${(fill * 100).toFixed(1)}%`;
        return (
          <Box
            key={index}
            boxSize={boxSize}
            as={readOnly ? "span" : "button"}
            type="button"
            cursor={readOnly ? "default" : "pointer"}
            onClick={(event) => handleClick(index + 1, event)}
            _active={!readOnly ? { transform: "scale(0.98)" } : undefined}
            bg={`linear-gradient(90deg, ${activeColor} ${percent}, ${resolvedIdle} ${percent})`}
            transition="background 0.2s ease"
            style={{
              WebkitMaskImage: STAR_MASK_URL,
              maskImage: STAR_MASK_URL,
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              WebkitMaskPosition: "center",
              maskPosition: "center",
            }}
          />
        );
      })}
      {showValue && (
        <Text
          ml={1}
          fontSize={size === "sm" ? "xs" : "sm"}
          color="rgba(235, 244, 255, 0.9)"
          fontWeight="medium"
        >
          {current.toFixed(1)}/{max}
        </Text>
      )}
    </HStack>
  );
};

export type StarRatingDisplayProps = HStackProps & {
  rating: number;
};

export const StarRatingDisplay = ({ rating, ...props }: StarRatingDisplayProps) => (
  <HStack spacing={2} {...props}>
    <RatingStars value={rating} readOnly size="sm" />
  </HStack>
);
