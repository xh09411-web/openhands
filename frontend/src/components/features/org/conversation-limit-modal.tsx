import { useTranslation } from "react-i18next";
import { ModalBackdrop } from "#/components/shared/modals/modal-backdrop";
import { BrandButton } from "#/components/features/settings/brand-button";
import { I18nKey } from "#/i18n/declaration";

interface ConversationLimitModalProps {
  onClose: () => void;
  onLearnMore?: () => void;
  limit?: number;
}

export function ConversationLimitModal({
  onClose,
  onLearnMore,
  limit = 3,
}: ConversationLimitModalProps) {
  const { t } = useTranslation();

  const handleLearnMore = () => {
    if (onLearnMore) {
      onLearnMore();
    } else {
      // Default: open docs in new tab
      window.open("https://docs.all-hands.dev/", "_blank");
    }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div
        data-testid="conversation-limit-modal"
        className="flex flex-col gap-6 rounded-xl border border-[#454545] bg-[#25272D] p-[30px]"
        style={{
          width: 523,
          boxShadow: `
            0px 7px 16px 0px rgba(0, 0, 0, 0.05),
            0px 29px 29px 0px rgba(0, 0, 0, 0.04),
            0px 66px 40px 0px rgba(0, 0, 0, 0.03),
            0px 117px 47px 0px rgba(0, 0, 0, 0.01),
            0px 183px 51px 0px rgba(0, 0, 0, 0)
          `,
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-[17px]">
          <h3
            className="text-xl font-semibold leading-6 text-white"
            style={{
              fontFamily:
                "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif",
              letterSpacing: "-0.01em",
            }}
          >
            {t(I18nKey.CONVERSATION_LIMIT$TITLE)}
          </h3>
        </div>

        {/* Body */}
        <p
          className="text-sm leading-5 text-[#A3A3A3]"
          style={{
            fontFamily:
              "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          {t(I18nKey.CONVERSATION_LIMIT$DESCRIPTION, { limit })}
        </p>

        {/* Footer */}
        <div className="flex gap-6">
          <BrandButton
            type="button"
            variant="primary"
            onClick={onClose}
            className="flex-1"
            testId="conversation-limit-close-button"
          >
            {t(I18nKey.BUTTON$CLOSE)}
          </BrandButton>
          <BrandButton
            type="button"
            variant="secondary"
            onClick={handleLearnMore}
            className="flex-1"
            testId="conversation-limit-learn-more-button"
          >
            {t(I18nKey.COMMON$LEARN_MORE)}
          </BrandButton>
        </div>
      </div>
    </ModalBackdrop>
  );
}
