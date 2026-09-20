import type { Construction } from './types'

export const demoConstruction: Construction = {
  name: 'Александр', project: 'Сосновка', area: 96, location: 'Всеволожский район · демонстрационный участок', contract: 'ДМ-2026/042',
  start: '2026-08-03', finish: '2026-10-18', progress: 58, manager: 'Михаил · прораб',
  stages: [
    { title:'Подготовка участка', dates:'3–7 августа', status:'done', detail:'Согласовали посадку дома, подготовили подъезд и выполнили разметку.' },
    { title:'Фундамент', dates:'8–14 августа', status:'done', detail:'Сваи установлены, оголовки выведены в один уровень. Выполнена обвязка.' },
    { title:'Каркас дома', dates:'15–31 августа', status:'done', detail:'Собраны стены и стропильная система. Проверена геометрия каркаса.' },
    { title:'Кровля и тёплый контур', dates:'1–18 сентября', status:'active', detail:'Укладываем кровельное покрытие, монтируем окна и утепляем наружные стены.' },
    { title:'Инженерия и отделка', dates:'19 сентября – 10 октября', status:'planned', detail:'Электрика, водоснабжение и внутренняя отделка по согласованной комплектации.' },
    { title:'Приёмка дома', dates:'11–18 октября', status:'planned', detail:'Проверим все системы, проведём уборку и передадим ключи.' },
  ],
  media: [
    { id:'roof', kind:'photo', src:'/photos/obekt-vuoksa-krovlya.webp', title:'Работы на кровле', date:'2026-09-11', stage:'Кровля' },
    { id:'frame', kind:'photo', src:'/photos/obekt-ladoga-karkas.webp', title:'Каркас и стропильная система', date:'2026-08-31', stage:'Каркас' },
    { id:'video', kind:'video', src:'/cabinet/demo-report.webm', poster:'/photos/obekt-ladoga-karkas.webp', title:'Демонстрационный видеоотчёт · слайд-шоу', date:'2026-09-10', stage:'Каркас' },
    { id:'foundation', kind:'photo', src:'/photos/obekt-kiviniemi-svai.webp', title:'Установлен свайный фундамент', date:'2026-08-14', stage:'Фундамент' },
    { id:'wall', kind:'photo', src:'/photos/uzel-steny.webp', title:'Утепление: детали узла', date:'2026-09-09', stage:'Утепление' },
  ],
  messages: [
    { id:'m1', from:'team', name:'Михаил · прораб', text:'Александр, добрый день! Каркас готов. Добавил фотографии, можно посмотреть детали сборки в отчётах.', date:'2026-09-10T09:30:00+03:00' },
    { id:'m2', from:'client', name:'Александр', text:'Спасибо! Когда планируется установка окон?', date:'2026-09-10T10:15:00+03:00' },
    { id:'m3', from:'team', name:'Михаил · прораб', text:'Окна привезут на следующей неделе. После монтажа добавим новый отчёт. Сейчас занимаемся кровлей.', date:'2026-09-10T10:24:00+03:00' },
  ],
}
