// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

const mockUser = {
	id: 1,
	full_name: 'Teszt Elek',
	username: 'teszt.elek',
	role: 'user',
	email: 'teszt.elek@example.com',
}

const mockAdminUser = {
	id: 2,
	full_name: 'Admin User',
	username: 'admin.user',
	role: 'admin',
	email: 'admin.user@example.com',
}

const mockCategories = [
	{
		id: 1,
		name: 'Szendvicsek',
		items: [
			{
				id: 101,
				name: 'Sajtos szendvics',
				picture_url: null,
				description: 'Friss sajtos szendvics',
				price: 990,
				is_active: true,
				default_time_to_deliver: 5,
				is_featured: true,
				category_id: 1,
				inventory_count: 12,
			},
		],
	},
	{
		id: 2,
		name: 'Italok',
		items: [
			{
				id: 201,
				name: 'Almale',
				picture_url: null,
				description: '100% gyumolcsle',
				price: 650,
				is_active: true,
				default_time_to_deliver: 3,
				is_featured: false,
				category_id: 2,
				inventory_count: 9,
			},
		],
	},
]

const mockOrderItems = [
	{
		item_id: 101,
		item_name: 'Sajtos szendvics',
		item_price: 990,
		quantity: 1,
		price: 990,
		picture_url: null,
	},
]

const mockOrders = [
	{
		id: 41,
		user_id: 1,
		user_username: 'teszt.elek',
		order_identifier_number: 4101,
		status: 'Keszitjuk',
		delivery_date: '2026-04-07T10:00:00',
		total_price: 990,
		default_completion_time: 12,
		created_at: '2026-04-07T09:48:00',
		comment: 'Sok szalveta',
		payment_intent_id: null,
		items: mockOrderItems,
	},
]

const mockBreaks = [{ start: '10:00', end: '10:15' }, { start: '12:00', end: '12:20' }]

const mockStatuses = [
	{ id: 1, name: 'Fizetésre vár' },
	{ id: 2, name: 'Készítjük' },
	{ id: 3, name: 'Átvehető' },
	{ id: 4, name: 'Átadva' },
	{ id: 5, name: 'Törölve' },
]

const replyWithMockApi = (req: Cypress.Request) => {
	const { method, url } = req

	if (method === 'GET' && url.includes('/api/account/me')) {
		req.reply({
			statusCode: 200,
			body: mockUser,
		})
		return
	}

	if (method === 'POST' && url.includes('/api/account/login')) {
		req.reply({ statusCode: 200, body: { access_token: 'mock-token-default' } })
		return
	}

	if (method === 'POST' && url.includes('/api/account/logout')) {
		req.reply({ statusCode: 200, body: {} })
		return
	}

	if (method === 'GET' && url.includes('/api/payment/stripe-key')) {
		req.reply({ statusCode: 200, body: { key: 'pk_test_mock_key' } })
		return
	}

	if (method === 'POST' && url.includes('/api/payment/checkout')) {
		req.reply({ statusCode: 200, body: { id: 1, client_secret: 'mock-client-secret' } })
		return
	}

	if (method === 'GET' && url.includes('/api/categories')) {
		req.reply({ statusCode: 200, body: mockCategories })
		return
	}

	if (method === 'GET' && url.includes('/api/items')) {
		if (/\/api\/items\/\d+$/.test(url)) {
			req.reply({
				statusCode: 200,
				body: { item: mockCategories[0].items[0] },
			})
			return
		}

		req.reply({ statusCode: 200, body: mockCategories.flatMap((category) => category.items) })
		return
	}

	if (method === 'GET' && url.includes('/api/orders/active')) {
		req.reply({ statusCode: 200, body: mockOrders })
		return
	}

	if (method === 'GET' && url.includes('/api/orders/breaks/')) {
		req.reply({ statusCode: 200, body: { breaks: mockBreaks } })
		return
	}

	if (method === 'GET' && /\/api\/orders\/\d+$/.test(url)) {
		req.reply({
			statusCode: 200,
			body: mockOrders[0],
		})
		return
	}

	if (method === 'GET' && url.includes('/api/orders')) {
		req.reply({ statusCode: 200, body: mockOrders })
		return
	}

	if (method === 'GET' && url.includes('/api/statuses')) {
		req.reply({ statusCode: 200, body: mockStatuses })
		return
	}

	if (url.includes('/broadcasting/auth')) {
		req.reply({ statusCode: 200, body: {} })
		return
	}

	if (method === 'GET') {
		req.reply({ statusCode: 200, body: {} })
		return
	}

	req.reply({ statusCode: 200, body: {} })
}

Cypress.on('window:before:load', (win) => {
	// Disable realtime backend sockets in tests so Echo/Pusher never reaches remote infra.
	class FakeWebSocket {
		url: string
		readyState = 3
		onopen: ((event: Event) => void) | null = null
		onerror: ((event: Event) => void) | null = null
		onclose: ((event: Event) => void) | null = null
		onmessage: ((event: MessageEvent) => void) | null = null

		constructor(url: string | URL) {
			this.url = String(url)
			setTimeout(() => {
				if (this.onerror) {
					this.onerror(new Event('error'))
				}
				if (this.onclose) {
					this.onclose(new Event('close'))
				}
			}, 0)
		}

		close() {}
		send() {}
		addEventListener() {}
		removeEventListener() {}
	}

	Object.defineProperty(win, 'WebSocket', {
		writable: true,
		value: FakeWebSocket,
	})
})

beforeEach(() => {
	// Catch-all backend mock to guarantee tests never talk to the real API.
	cy.intercept('https://bufeapi.jcloud.jedlik.cloud/**', (req) => {
		replyWithMockApi(req)
	}).as('mockAllBackendRequests')

	cy.intercept('**/api/**', (req) => {
		replyWithMockApi(req)
	}).as('mockAnyApiHost')

	// Default API mocks for all tests; specific specs can override these intercepts.
	cy.intercept('POST', '**/account/login', {
		statusCode: 200,
		body: { access_token: 'mock-token-default' },
	}).as('mockLoginDefault')

	cy.intercept('GET', '**/account/me', {
		statusCode: 200,
		body: mockUser,
	}).as('mockMeDefault')

	cy.intercept('GET', '**/payment/stripe-key', {
		statusCode: 200,
		body: { key: 'pk_test_mock_key' },
	}).as('mockStripeKeyDefault')
})