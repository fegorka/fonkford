![](https://github.com/fegorka/fonkford/blob/master/thumbnail.png)

Бот для моего Discord сервера, зачем искать ботов, если можно написать своего?
<br/><br/>

# Функции

### Приватные команты

Боту назначается специальный канал и категория, при подключении к этому каналу, в категории создаётся ещё 1 канал (приватная команата), и пользователя перекидывает в него. После того, как пользователь ливнет, комната удаляется
<br/><br/>

### Воспроизведение видео с Youtube (звук)

Это для всякой музочки, можно создавать очередь треков, скипать треки, ставить на паузу и перемещать бота между каналами
<br/><br/>


### Создание персонажей для НРИ

Реализовано через модальное окно, удобно для игроков, чтобы ничего не забывать. Можно сохранять, удалять, просматривать конкретного персонажа или список
<br/><br/>

### Технические уведомления

Боту назначается специальный канал, в который он будет отправлять логи или другие сообщения для админов
<br/><br/>

### Настройка конфигов

Админы могут изменять конфиги, например, канал и категорию для приватных комнат
<br/><br/>

# Настройки

Запуск
```
npm run serve
```

Для регистрации изменений команд необходимо произвести их деплой
```
npm run deploy
```
<br/><br/>

# Дополнительно

Поскольку бот разрабатывается конкретно для моего сервера, Я не закладывал возможности использования на нескольких серверах (хотя, струкутру легко под это переделать), это может и вызовет ошибки. Также бота лучше приглашать на сервер с правами Администратора
