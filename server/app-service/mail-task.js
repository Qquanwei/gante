const helpers = require("../helpers");
const pug = require('pug');
const path = require('path');
const dayjs = require("dayjs");
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
dayjs.extend(isSameOrBefore)

module.exports = function (app) {
  async function generateMailContent(app, user) {
    const pgClient = app.pgClient;
    const agenda = await helpers.queryOne(pgClient.query("select * from snapshots where collection='agent' and doc_id = $1", [user.defaulttableid || user.defaultTableId]));
    if (agenda && agenda.data && agenda.data.todo && agenda.data.todo.length) {
      const allTask = agenda.data.todo.filter((todo) => {
        return todo.headline === 'todo';
      })
      const todayTask = allTask.filter(todo => {
        return dayjs(todo.schedule).isSameOrBefore(dayjs());
      });
      const formatTodo = (todo) => {
        const diff = dayjs().diff(dayjs(todo.schedule).startOf('day'), 'day');

        if (diff > 0) {
          return '+' +  diff + '天 ' + todo.title;
        }
        if (diff === 0) {
          return todo.title;
        }

        return dayjs(todo.schedule).format('YYYY/MM/DD') + ' ' + todo.title;

      }
      const htmlMail = pug.renderFile(path.resolve(__dirname, './utils/mail-template.pug'), {
        date: (new Date()).toLocaleDateString(),
        todayTasks: todayTask.map(formatTodo),
        allTasks: allTask.map(formatTodo)
      })
      return htmlMail;
    }
    return '';
  }

  async function triggerAllMailTask() {
    const pgClient = app.pgClient;
    const users = await helpers.queryAll(pgClient.query("select defaultTableId as defaultTableId, email from users where (extra::jsonb -> 'enableMailAgenda')::boolean = true and email is not null"));
    for (user of users) {
      triggerUserMailTask(user);
    }
  }

  async function triggerUserMailTask(user) {
    console.log('用户触发发送邮件', user);
    if (!user || !user.email) {
      console.log('找不到用户信息，跳过')
      return;
    }
    const content = await generateMailContent(app, user);
    if (content) {
      await app.smtp.sendMail(user.email, `${(new Date()).toLocaleString()} Gante Daily Agenda`, '', content);
    } else {
      console.log('邮件无内容。跳过');
    }
  }

  app.mailTask = (() => {
    return {
      triggerAllMailTask,
      triggerUserMailTask
    }
  })();
}
