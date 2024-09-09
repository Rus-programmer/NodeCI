const Page = require('./heplers/page')

let page;
beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000')
})

test('the header has the correct text', async () => {
    const text = await page.getContentsOf('a.brand-logo')
    expect(text).toEqual('Blogster')
})

test('clicking login start oauth flow', async () => {
    await page.click('.right a')

    const url = await page.url();
    expect(url).toContain('https://accounts.google.com/')
})

test('when sign in shows logout button', async () => {
    await page.login();

    const text = await page.getContentsOf('a[href="/auth/logout"]')
    expect(text).toEqual('Logout')
})

afterEach(async () => {
    await page.close()
})