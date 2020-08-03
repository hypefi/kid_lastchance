FROM_EMAIL = "khidma <admin@khidma.io>";

Meteor.startup(function () {


  if (Meteor.settings && Meteor.settings.smtp) {
    const { userName, password, host, port, isSecure } = Meteor.settings.smtp;
    const scheme = isSecure ? 'smtps' : 'smtp';
    process.env.MAIL_URL = `${scheme}://${encodeURIComponent(userName)}:${encodeURIComponent(password)}@${host}:${port}`;
  }
});
