const path = require('path')

class VueI18n {
  /**
   * Default plugin options
   */
  static defaultOptions () {
    return {
      locales: [],
      messages: {},
      pathAliases: {},
      defaultLocale: null,
      enablePathRewrite: true
    }
  }

  /**
   * 
   * @param {*} api 
   * @param {*} options 
   */
  constructor (api, options) {
    this.api = api
    this.pages = api._app.pages
    this.options = options
    this.options.defaultLocale = options.defaultLocale || options.locales[0]
    api._app.pages.hooks.createRoute.tap('i18n', this.createRouteHook.bind(this))
    api._app.pages.hooks.pageContext.tap('i18n', this.createPageHook.bind(this))
    api.createManagedPages(this.createManagedPages.bind(this))
  }

  /**
   * Create manage pages
   * 
   * @param {function} param.findPages
   * @param {function} param.createPage
   */
  createManagedPages({ findPages, createPage }) {
    // List all pages
    const pages = findPages();
    for (const page of pages) {
      // Load page's route
      const route = this.pages.getRoute(page.internal.route)
      for (const locale of this.options.locales) {
        // Create a page clone on a path with locale segment
        const pathSegment = this.options.pathAliases[locale] || locale
        createPage({
          path: path.join(`/${pathSegment}/`, route.path),
          component: route.component,
          context: Object.assign({}, page.context, {
            locale:  `${locale}`
          }),
          route:{
            meta: {
              locale:  `${locale}`
            }
          }
        })
      }
    }
  }

  /**
   * Hook into create route process
   * 
   * @param {*} options
   */
  createRouteHook(options) {
    const meta = options.internal.meta
    if (meta && meta.locale) {
      if (options.name === '404' && options.path !== '/404/') {
        options.name = `${options.name}__${meta.locale}`
      }
    }

    if (!meta.locale) {
      options.internal.meta.locale = this.options.defaultLocale
    }

    return options
  }

  /**
   * Hook into create page process
   * 
   * @param {*} options
   */
  createPageHook(context) {
    context.locale = this.options.defaultLocale
  }

}

module.exports = VueI18n
