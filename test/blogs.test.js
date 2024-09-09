const Page = require('./heplers/page')

let page;
beforeEach(async () => {
    console.log('beforeEach')
    page = await Page.build();
    await page.goto('http://localhost:3000')
})

afterEach(async () => {
    console.log('afterEach')
    await page.close()
})

describe('When loggen in', async () => {
    beforeEach(async () => {
        console.log('describe beforeEach')
        await page.login();
        await page.click('a.btn-floating');
    })

    test('can see blog create form', async () => {
        const form = await page.getContentsOf('[data-testid="blog-form"]')
        expect(form).not.toBeNull()
    })

    describe('and using invalid inputs', async () => {
        beforeEach(async () => {
            await page.click('form button')
        })

        test('the form shows an error message', async () => {
            const titleError = await page.getContentsOf('.title .red-text')
            const contentError = await page.getContentsOf('.content .red-text')
            expect(titleError).toEqual('You must provide a value')
            expect(contentError).toEqual('You must provide a value')
        })
    })

    describe('and using valid inputs', async () => {
        beforeEach(async () => {
            await page.type('.title input', 'my title')
            await page.type('.content input', 'my content')
            await page.click('form button');
        })

        test('submitting takes user to review screen', async () => {
            const text = await page.getContentsOf('h5')
            expect(text).toEqual('Please confirm your entries')
        })

        test('submitting then saving adds blog to index page', async () => {
            await page.click('button.green');
            await page.waitFor('.card');
            const title = await page.getContentsOf('.card-title')
            const content = await page.getContentsOf('p')
            expect(title).toEqual('my title')
            expect(content).toEqual('my content')
        })
    })
})

describe('When not loggen in', async () => {
    const actions = [
        {
            method: 'get',
            path: '/api/blogs'
        },
        {
            method: 'post',
            path: '/api/blogs',
            body: {title: 'My test title', content: 'My test Content'}
        }
    ]

    test('blog related actions are prohibited', async () => {
        const results = await page.execRequest(actions);
        results.forEach(result => {
            expect(JSON.stringify(result)).toMatch(/error/)
        })
    })
})