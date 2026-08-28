import React, { useMemo, memo } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { triggerConfetti } from "../../../utils/helpers";
import { WISH_MAX_LENGTH } from "../../../config/constants";
import { getWishSchema } from "../../../validations/schemas";

export const WishesSection = memo(function WishesSection({ copy, submitWish, approvedWishes }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  const wishes = Array.isArray(approvedWishes) ? approvedWishes : [];

  const wishSchema = useMemo(() => getWishSchema(t), [t]);
  const { control, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(wishSchema),
    defaultValues: { name: "", message: "", honeypot: "" }
  });

  const currentMessage = watch("message") || "";

  const onSubmit = async (data) => {
    if (data.honeypot) return;
    await submitWish(data);
    triggerConfetti();
    reset();
  };

  return (
    <section className="card">
      <p className="section-label">{isEn ? t('invitation.wishesLabel') : copy?.wishesLabel}</p>
      <h2>{isEn ? t('invitation.wishesTitle') : copy?.wishesTitle}</h2>
      
      <form className="wish-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <input type="text" {...control.register("honeypot")} style={{ display: "none", opacity: 0, position: "absolute", zIndex: -1 }} tabIndex={-1} autoComplete="off" />

        <div style={{ width: '100%' }}>
          <Controller name="name" control={control} render={({ field }) => <input {...field} placeholder={t('form.namePlaceholder')} />} />
          {errors.name && <span style={{ color: 'red', fontSize: '13px', display: 'block', marginTop: '6px' }}>{errors.name.message}</span>}
        </div>
        
        <div className="field-with-counter">
          <Controller name="message" control={control} render={({ field }) => <textarea {...field} placeholder={t('form.messagePlaceholder')} maxLength={WISH_MAX_LENGTH}></textarea>} />
          <span>{currentMessage.length}/{WISH_MAX_LENGTH}</span>
          {errors.message && <span style={{ color: 'red', fontSize: '13px', display: 'block', marginTop: '6px' }}>{errors.message.message}</span>}
        </div>
        
        <button type="submit" className="main-button form-button" disabled={isSubmitting}>
          {isSubmitting ? "..." : t('form.submitWish')}
        </button>
      </form>
      
      <div className="wish-list">
        {wishes.length === 0 ? (
          <p className="empty-text">{t('ui.noWishes')}</p>
        ) : (
          wishes.slice(0, 4).map((wish) => (
            <div className="wish-item" key={wish.id}>
              <p>"{wish.message}"</p>
              <strong>{wish.name}</strong>
            </div>
          ))
        )}
      </div>
    </section>
  );
});