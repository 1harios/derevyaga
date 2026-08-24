/**
 * Коды внешних виджетов. Правятся менеджером без разработчика.
 *
 * Онлайн-чат amoCRM («Кнопка на сайт»). Код взят в кабинете amoCRM:
 * Настройки → Чаты и мессенджеры → Онлайн чат → Настроить → скопировать код.
 * Если кнопку перевыпустят — вставьте новый код целиком между обратными
 * кавычками ниже, можно вместе с тегами <script>: они уберутся автоматически.
 *
 * Если строку опустошить, чат с сайта пропадёт. В статическом превью
 * (NEXT_PUBLIC_DEMO_MODE=1) чат не грузится в любом случае.
 *
 * Чат amoCRM ставит свои cookie для склейки диалога — упомянут в политике
 * cookie (юрист готовит тексты на пятой итерации).
 */
export const amoChatSnippet = `<script>(function(a,m,o,c,r,m){a[m]={id:"449655",hash:"1df5177c912da0378ea69603325edeff283f5ccb6a24a70ff5f2d43ae332a71b",locale:"ru",inline:true,setMeta:function(p){this.params=(this.params||[]).concat([p])}};a[o]=a[o]||function(){(a[o].q=a[o].q||[]).push(arguments)};a[o+'Config']=a[o+'Config']||{};a[o+'Config'].hidden=!0;var d=a.document,s=d.createElement('script');s.async=true;s.id=m+'_script';s.src='https://gso.amocrm.ru/js/button.js';d.head&&d.head.appendChild(s)}(window,0,'amoSocialButton',0,0,'amo_social_button'));</script>`
