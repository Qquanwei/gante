module.exports = function(option) {
  return async function(ctx, next) {
    if ('/\/login/'.test(ctx.pathname)) {
      await next();
      return;
    }

    if (ctx.cookies.get('ud')) {
      await next();
    } else {
      ctx.redirect('/login');
    }
  };
}
