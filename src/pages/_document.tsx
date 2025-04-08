import Document, { Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps } from 'next/document'

interface MyDocumentProps extends DocumentInitialProps {
  bodyClass: string;
}

class MyDocument extends Document<MyDocumentProps> {
  static async getInitialProps(ctx: DocumentContext): Promise<MyDocumentProps> {
    const initialProps = await Document.getInitialProps(ctx)
    
    // Determine if current page is homepage or project page
    const isHomePage = ctx.pathname === '/'
    const isProjectPage = /^\/[^\/]+$/.test(ctx.pathname) && ctx.pathname !== '/_app' && ctx.pathname !== '/_document'
    
    // Add appropriate class to body
    let bodyClass = ''
    if (isHomePage) {
      bodyClass = 'home-page'
    } else if (isProjectPage) {
      bodyClass = 'project-page'
    }
    
    return { 
      ...initialProps,
      bodyClass 
    }
  }

  render() {
    return (
      <Html lang="en">
        <Head />
        <body className={this.props.bodyClass || ''}>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument 