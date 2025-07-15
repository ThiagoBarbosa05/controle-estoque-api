import puppeteer from "puppeteer";
import "dotenv/config";

export async function getAuthorizationCode(): Promise<string | null> {
  if (!process.env.BLING_USER_EMAIL || !process.env.BLING_USER_PASSWORD || !process.env.BLING_CLIENT_ID) {
    console.error('Credenciais do Bling não configuradas nas variáveis de ambiente.');
    return null;
  }

  const REDIRECT_URI = 'https://h9gxyubov5.execute-api.us-east-2.amazonaws.com/auth/callback';

  const browser = await puppeteer.launch({ headless: true , executablePath: '/usr/bin/chromium-browser'});
  const page = await browser.newPage(); 
  let authorizationCode: string | null = null;

  const authorizationUrl = `https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${process.env.BLING_CLIENT_ID}&state=automacao`;

  try {
    console.log('Iniciando processo de autorização automatizada...');
    await page.goto(authorizationUrl);

    // Espera o formulário de login carregar
    await page.waitForSelector('input[name="login"]');
    await page.waitForSelector('input[name="password"]');
    await page.waitForSelector('button[type="submit"]');

    // Preenche as credenciais e submete o formulário
    await page.type('input[name="login"]', process.env.BLING_USER_EMAIL);
    await page.type('input[name="password"]', process.env.BLING_USER_PASSWORD);
    
    console.log('Credenciais preenchidas, submetendo formulário...');             

    // Intercepta a requisição de callback para pegar o código
    page.on('request', (request) => {
      const url = request.url();
      if (url.startsWith(REDIRECT_URI)) {
        const urlParams = new URLSearchParams(new URL(url).search);
        const code = urlParams.get('code');
        if (code) {
          authorizationCode = code;
          console.log('Código de autorização capturado com sucesso.');
        }
      }
    });

    await page.click('button[type="submit"]');

    // Aguarda a navegação ou um tempo limite
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

  } catch (error) {
    console.error('Erro durante a automação do login no Bling:', error);
    await page.screenshot({ path: 'error_screenshot.png' });
    console.log('Screenshot do erro salvo em "error_screenshot.png"');
  } finally {
    await browser.close();
  }

  return authorizationCode;
}