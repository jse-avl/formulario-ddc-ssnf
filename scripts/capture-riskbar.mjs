import { chromium } from '@playwright/test'

async function capture() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

  const base = 'http://localhost:3000'
  const out = 'C:\\Users\\echoe\\OneDrive\\Documents\\ddc\\ddc-ssnf\\docs\\screenshots'

  // 1. Public pages
  const publicPages = [
    { url: '/', name: 'public-home' },
    { url: '/privacy', name: 'public-privacy' },
    { url: '/cookies', name: 'public-cookies' },
    { url: '/contact', name: 'public-contact' },
    { url: '/sign-in', name: 'public-signin' },
    { url: '/sign-up', name: 'public-signup' },
  ]
  for (const p of publicPages) {
    await page.goto(`${base}${p.url}`, { waitUntil: 'networkidle' })
    await page.screenshot({ path: `${out}/${p.name}.png`, fullPage: true })
    console.log(`✓ ${p.name}`)
  }

  // 2. Form step 1 - tipo
  await page.goto(`${base}/clientes/nuevo`, { waitUntil: 'networkidle' })
  await page.screenshot({ path: `${out}/form-paso1-tipo.png`, fullPage: true })
  console.log('✓ form-paso1-tipo')

  // 3. Form step 2 - datos vacíos
  await page.click('button:has-text("Siguiente")')
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${out}/form-paso2-vacio.png`, fullPage: true })
  console.log('✓ form-paso2-vacio')

  // 4. Form step 2 - datos llenos (riesgo bajo)
  await page.fill('#nombreCompleto', 'Maria Fernanda Rodriguez Lopez')
  await page.fill('#numeroIdentificacion', '1234567890')
  await page.fill('#actividadDeclarada', 'Consultoria empresarial')
  await page.fill('#direccion', 'Calle Principal 123, Quito')
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${out}/form-paso2-bajo-riesgo.png`, fullPage: true })
  console.log('✓ form-paso2-bajo-riesgo')

  // 5. Form step 2 - datos con riesgo alto
  await page.fill('#nombreCompleto', 'Saddam Hussein Al-Rashid')
  await page.fill('#actividadDeclarada', 'Casino y juego online, exchange de criptomonedas')
  if (await page.isVisible('#paisConstitucion')) {
    await page.fill('#paisConstitucion', 'Iran')
  }
  if (await page.isVisible('#jurisdiccionesOperacion')) {
    await page.fill('#jurisdiccionesOperacion', 'Panama, Dubai, Emiratos')
  }
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${out}/form-paso2-alto-riesgo.png`, fullPage: true })
  console.log('✓ form-paso2-alto-riesgo')

  // 6. Form step 2 - riesgo medio
  await page.fill('#nombreCompleto', 'Carlos Eduardo Martinez')
  if (await page.isVisible('#paisConstitucion')) {
    await page.fill('#paisConstitucion', 'Panama')
  }
  if (await page.isVisible('#jurisdiccionesOperacion')) {
    await page.fill('#jurisdiccionesOperacion', 'Panama')
  }
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `${out}/form-paso2-medio-riesgo.png`, fullPage: true })
  console.log('✓ form-paso2-medio-riesgo')

  await browser.close()
  console.log('\nDone!')
}

capture().catch((e) => {
  console.error(e)
  process.exit(1)
})
