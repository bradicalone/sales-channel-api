require('isomorphic-fetch');
require('dotenv').config();
const Koa = require('koa');
const shopifyAuth = require('@shopify/koa-shopify-auth');

const {default: createShopifyAuth, verifyRequest } = require('@shopify/koa-shopify-auth');
const {default: Shopify, ApiVersion} = require('@shopify/shopify-api');
console.log('shopifyAuth:', Shopify)
const Router = require('koa-router');

const { SHOPIFY_API_SECRET, SHOPIFY_API_KEY, SHOPIFY_API_SCOPES, SHOPIFY_APP_URL } = process.env;

const ACTIVE_SHOPIFY_SHOPS = {}
const port = parseInt(process.env.PORT, 10) || 3001
const dev = process.env.NODE_ENV !== 'production';
console.log('dev:', dev)


// initializes the library
Shopify.Context.initialize({
    API_KEY: SHOPIFY_API_KEY,
    API_SECRET_KEY: SHOPIFY_API_SECRET,
    SCOPES: SHOPIFY_API_SCOPES,
    HOST_NAME: SHOPIFY_APP_URL.replace(/^https:\/\//, ''),
    API_VERSION: ApiVersion.October21,
    IS_EMBEDDED_APP: true,
    // More information at https://github.com/Shopify/shopify-node-api/blob/main/docs/issues.md#notes-on-session-handling
    SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

  const server = new Koa()
  const router = new Router()
  server.keys = [Shopify.Context.API_SECRET_KEY]



  server.use(
    createShopifyAuth({
        apiKey: SHOPIFY_API_KEY,
        secret: SHOPIFY_API_SECRET,
        accessMode: 'offline',
        scopes: ['read_products, write_products'],
        afterAuth(ctx) {
        console.log('H ')
        const {shop, accessToken} = ctx.state.shopify;
            console.log('shop, accessToken, scope:', shop, accessToken)
            ACTIVE_SHOPIFY_SHOPS[shop] = true
            console.log('shop, accessToken:', shop, accessToken)
            // ctx.cookies.set('accessToken', accessToken, {httpOnly: false})
            // ctx.cookies.set('shopOrigin', shop, {httpOnly: false})
            ctx.redirect(`/?shop=${shop}`);
        },
    })
);


  const handleRequest = async (ctx) => {
    console.log('handleRequest:')
    //   await handle(ctx.req, ctx.res);
        ctx.body = '🎉';
      ctx.respond = false
      ctx.res.statusCode = 200
  }

  router.get('/', async (ctx) => {
    const shop = ctx.query.shop;
  
    // If this shop hasn't been seen yet, go through OAuth to create a session
    if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
        ctx.redirect(`/auth?shop=${shop}`);
    } else {
        console.log('shop bottom:', shop)
      // Load app skeleton. Don't include sensitive information here!
      ctx.body = '🎉';
    }
});


  router.get('(.*)', verifyRequest(), async (ctx) => {
    // Your application code goes here
    console.log('123l')
    ctx.body = '🎉';
  });
  router.get('(.*)', handleRequest)
  server.use(router.allowedMethods())
  server.use(router.routes())

  server.listen(port,  () => {
    console.log('client server on ' + port)  
  })