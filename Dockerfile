# ایمیج اجرا — هیچ build و هیچ npm install اینجا انجام نمی‌شود.
#
# دلیلش پلن سرور است: ۵۱۲ مگابایت رم برای اینکه npm آنجا ۴۳۱ مگابایت
# node_modules را استخراج کند کافی نیست و پروسه با «Exit handler never
# called!» کشته می‌شود. پس build روی ماشین توسعه انجام می‌شود
# (`npm run build:deploy`، حدود ۳۰ ثانیه) و اینجا فقط خروجی آماده‌ی
# ۲۳ مگابایتی کپی می‌شود.
#
# پوشه‌ی deploy/ را scripts/prepare-deploy.mjs می‌سازد.

FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
# سرور standalone پیش‌فرض روی localhost گوش می‌دهد؛ داخل کانتینر باید
# روی همه‌ی اینترفیس‌ها باشد وگرنه لیارا به آن نمی‌رسد.
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# مالکیت با کاربر node تا Next بتواند کش ISR را بنویسد
COPY --chown=node:node deploy ./

USER node

EXPOSE 3000

CMD ["node", "server.js"]
