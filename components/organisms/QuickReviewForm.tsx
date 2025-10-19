"use client";

import { type FormEvent, useCallback, useMemo, useState } from "react";
import {
  Box,
  Button,
  Field,
  Heading,
  Icon,
  Input,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useParams } from "next/navigation";
import { FiSend } from "react-icons/fi";

import {
  ensureAnonReviewSession,
  getBrowserSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/browser-client";
import { RatingStars } from "@/components/atoms/StarRatingDisplay";

type FormState = {
  userName: string;
  rating: number;
  comment: string;
};

const initialState: FormState = {
  userName: "",
  rating: 5,
  comment: "",
};

const COMMENT_MAX_LENGTH = 200;

export function QuickReviewForm() {
  const supabaseConfigured = isSupabaseConfigured();
  const params = useParams();
  const rawId =
    (params as Record<string, string | string[] | undefined>).id ??
    (params as Record<string, string | string[] | undefined>).gameId;
  const gameId = useMemo(() => {
    if (typeof rawId === "string") {
      return rawId;
    }
    if (Array.isArray(rawId) && rawId.length > 0) {
      return rawId[0];
    }
    return null;
  }, [rawId]);

  const [formState, setFormState] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<keyof FormState, string | null>>({
    userName: null,
    rating: null,
    comment: null,
  });
  const [feedback, setFeedback] = useState<{
    status: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const updateField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const validate = useCallback(() => {
    const nextErrors: Record<keyof FormState, string | null> = {
      userName: null,
      rating: null,
      comment: null,
    };

    if (!formState.userName.trim()) {
      nextErrors.userName = "ユーザー名を入力してください。";
    } else if (formState.userName.length > 40) {
      nextErrors.userName = "ユーザー名は40文字以内で入力してください。";
    }

    const ratingValue = formState.rating;
    if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      nextErrors.rating = "評価は1〜5の範囲で選択してください。";
    }

    if (!formState.comment.trim()) {
      nextErrors.comment = "一言コメントを入力してください。";
    } else if (formState.comment.length > COMMENT_MAX_LENGTH) {
      nextErrors.comment = `一言コメントは${COMMENT_MAX_LENGTH}文字以内で入力してください。`;
    }

    setErrors(nextErrors);
    return Object.values(nextErrors).every((value) => value === null);
  }, [formState]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (submitting) {
        return;
      }
      if (!gameId) {
        setFeedback({
          status: "error",
          message: "ゲームIDが取得できませんでした。ページを再読み込みしてください。",
        });
        return;
      }
      if (!supabaseConfigured) {
        setFeedback({
          status: "info",
          message: "レビュー送信はまだできません。Supabase の設定が完了すると投稿できます。",
        });
        return;
      }
      const isValid = validate();
      if (!isValid) {
        return;
      }

      setSubmitting(true);
      setFeedback(null);

      try {
        const client = getBrowserSupabaseClient();
        await ensureAnonReviewSession(client);

        const trimmedUserName = formState.userName.trim();
        const trimmedComment = formState.comment.trim();
        const reviewId = crypto.randomUUID();

        const { error } = await client.from("oneliner_reviews").insert({
          id: reviewId,
          game_id: gameId,
          user_name: trimmedUserName,
          rating: formState.rating,
          comment: trimmedComment,
          status: "pending",
        });

        if (error) {
          throw error;
        }

        setFormState(initialState);
        void (async () => {
          try {
            await fetch("/api/reviews/notify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                gameId,
                userName: trimmedUserName,
                rating: formState.rating,
                comment: trimmedComment,
                reviewId,
              }),
            });
          } catch (notifyError) {
            console.error("Failed to send review notification", notifyError);
          }
        })();
        setFeedback({
          status: "success",
          message: "レビューを受け付けました。管理者の承認後に表示されます。",
        });
      } catch (error) {
        console.error("Failed to submit quick review", error);
        setFeedback({
          status: "error",
          message: "レビューの送信に失敗しました。時間をおいて再度お試しください。",
        });
      } finally {
        setSubmitting(false);
      }
    },
    [
      formState.comment,
      formState.rating,
      formState.userName,
      gameId,
      submitting,
      supabaseConfigured,
      validate,
    ]
  );

  return (
    <Box
      as="section"
      w="full"
      maxW={{ base: "100%", xl: "360px" }}
      bg="rgba(10, 24, 60, 0.92)"
      borderRadius="24px"
      border="1px solid rgba(94, 126, 255, 0.28)"
      boxShadow="0 18px 45px rgba(20, 46, 120, 0.35)"
      backdropFilter="blur(12px)"
      px={{ base: 4, md: 5 }}
      py={{ base: 5, md: 6 }}
    >
      <Stack spacing={4}>
        <Heading
          as="h2"
          fontSize="lg"
          fontWeight="semibold"
          color="rgba(253, 254, 255, 0.95)"
          letterSpacing="0.01em"
        >
          クイックレビュー投稿
        </Heading>

        <Stack as="form" onSubmit={handleSubmit} spacing={4}>
            <Field.Root
              invalid={Boolean(errors.userName)}
              disabled={!supabaseConfigured}
              required
              gap={2}
            >
              <Field.Label color="rgba(253, 254, 255, 0.9)">ユーザー名</Field.Label>
              <Input
                value={formState.userName}
                onChange={(event) => updateField("userName", event.target.value)}
                placeholder="ニックネームを入力"
                size="md"
                disabled={!supabaseConfigured}
                borderRadius="999px"
                bg="rgba(12, 28, 68, 0.9)"
                border="1px solid rgba(98, 130, 255, 0.35)"
                _placeholder={{ color: "rgba(200, 212, 255, 0.55)" }}
                color="rgba(253, 254, 255, 0.92)"
              />
              {errors.userName && <Field.ErrorText>{errors.userName}</Field.ErrorText>}
            </Field.Root>

            <Field.Root
              invalid={Boolean(errors.rating)}
              disabled={!supabaseConfigured}
              required
              gap={2}
            >
              <Field.Label color="rgba(253, 254, 255, 0.9)">評価</Field.Label>
              <Stack direction="row" align="center" spacing={3}>
                <RatingStars
                  value={formState.rating}
                  precision={1}
                  readOnly={!supabaseConfigured}
                  size="md"
                  activeColor="#ffe27a"
                  idleColor="rgba(255, 255, 255, 0.18)"
                  onChange={(value) =>
                    updateField("rating", Math.max(1, Math.min(5, Math.round(value))))
                  }
                  ariaLabel="レビュー評価"
                />
                <Text fontSize="sm" color="rgba(210, 220, 255, 0.7)">
                  評価を選択
                </Text>
              </Stack>
              {errors.rating && <Field.ErrorText>{errors.rating}</Field.ErrorText>}
            </Field.Root>

            <Field.Root
              invalid={Boolean(errors.comment)}
              disabled={!supabaseConfigured}
              required
              gap={2}
            >
              <Field.Label color="rgba(253, 254, 255, 0.9)">一言コメント</Field.Label>
              <Textarea
                value={formState.comment}
                onChange={(event) => updateField("comment", event.target.value)}
                placeholder="このゲームについての感想を教えてください..."
                resize="vertical"
                rows={4}
                disabled={!supabaseConfigured}
                borderRadius="20px"
                bg="rgba(12, 28, 68, 0.9)"
                border="1px solid rgba(98, 130, 255, 0.35)"
                _placeholder={{ color: "rgba(200, 212, 255, 0.55)" }}
                color="rgba(253, 254, 255, 0.92)"
              />
              {errors.comment && <Field.ErrorText>{errors.comment}</Field.ErrorText>}
              <Text
                color="rgba(255,255,255,0.65)"
                fontSize="sm"
                textAlign="right"
              >
                {formState.comment.length}/{COMMENT_MAX_LENGTH}
              </Text>
            </Field.Root>

            <Button
              type="submit"
              variant="outline"
              borderRadius="999px"
              border="1px solid rgba(120, 150, 255, 0.6)"
              color="rgba(222, 232, 255, 0.92)"
              _hover={{ bg: "rgba(80, 120, 255, 0.18)" }}
              _active={{ bg: "rgba(80, 120, 255, 0.28)" }}
              isLoading={submitting}
              isDisabled={!gameId || !supabaseConfigured}
              leftIcon={<Icon as={FiSend} />}
            >
              レビューを投稿
            </Button>
        </Stack>

        <Stack spacing={1}>
          <Text color="rgba(255,255,255,0.7)" fontSize="sm">
            ※投稿されたレビューは管理者の承認後に表示されます。
          </Text>
          {!supabaseConfigured && (
            <Text color="rgba(255,200,200,0.85)" fontSize="sm">
              現在 Supabase の設定が未完了のため、フォームは表示のみとなっています。
            </Text>
          )}
          {feedback && (
            <Text
              color={
                feedback.status === "success"
                  ? "rgba(138, 255, 191, 0.9)"
                  : feedback.status === "error"
                    ? "rgba(255, 180, 180, 0.95)"
                    : "rgba(160, 200, 255, 0.9)"
              }
              fontSize="sm"
            >
              {feedback.message}
            </Text>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
