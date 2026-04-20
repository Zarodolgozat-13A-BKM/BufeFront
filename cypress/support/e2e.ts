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

type MockReply<T> =
	| T
	| {
			statusCode: number
			body: T
	  }

type PaginatedOrderResponse = {
	data: Array<Record<string, unknown>>
	links: {
		first: string
		last: string | null
		prev: string | null
		next: string | null
	}
	meta: {
		current_page: number
		from: number
		last_page: number
		links: Array<{
			url: string
			label: string
			active: boolean
		}>
		path: string
		per_page: number
		to: number
		total: number
	}
}

type ApiMockConfig = {
	me: MockReply<Record<string, unknown>>
	login: MockReply<Record<string, unknown>>
	logout: MockReply<Record<string, unknown>>
	stripeKey: MockReply<Record<string, unknown>>
	checkout: MockReply<Record<string, unknown>>
	categories: MockReply<Array<Record<string, unknown>>>
	items: MockReply<Array<Record<string, unknown>>>
	itemById: MockReply<Record<string, unknown>>
	activeOrders: MockReply<Array<Record<string, unknown>>>
	breaks: MockReply<Record<string, unknown>>
	orderById: MockReply<Record<string, unknown>>
	orders: MockReply<PaginatedOrderResponse>
	statuses: MockReply<Array<Record<string, unknown>>>
	broadcastAuth: MockReply<Record<string, unknown>>
}

const mockUser = {
	id: 1,
	full_name: 'Teszt Elek',
	username: 'teszt.elek',
	role: 'user',
	email: 'teszt.elek@example.com',
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
		items: mockOrderItems,
	},
]

const createMockOrderResponse = (
	data: Array<Record<string, unknown>> = mockOrders,
): PaginatedOrderResponse => ({
	data,
	links: {
		first: '/api/orders?page=1',
		last: '/api/orders?page=1',
		prev: null,
		next: null,
	},
	meta: {
		current_page: 1,
		from: 1,
		last_page: 1,
		links: [
			{
				url: '/api/orders?page=1',
				label: '1',
				active: true,
			},
		],
		path: '/api/orders',
		per_page: 10,
		to: data.length,
		total: data.length,
	},
})

const mockBreaks = [{ start: '10:00', end: '10:15' }, { start: '12:00', end: '12:20' }]

const mockStatuses = [
	{ id: 1, name: 'Fizetésre vár' },
	{ id: 2, name: 'Készítjük' },
	{ id: 3, name: 'Átvehető' },
	{ id: 4, name: 'Átadva' },
	{ id: 5, name: 'Törölve' },
]

const defaultMocks: ApiMockConfig = {
	me: mockUser,
	login: { access_token: 'mock-token-default' },
	logout: {},
	stripeKey: { key: 'pk_test_mock_key' },
	checkout: { id: 1, client_secret: 'mock-client-secret' },
	categories: mockCategories,
	items: mockCategories.flatMap((category) => category.items) as Array<Record<string, unknown>>,
	itemById: { item: mockCategories[0].items[0] },
	activeOrders: mockOrders as Array<Record<string, unknown>>,
	breaks: { breaks: mockBreaks },
	orderById: mockOrders[0] as Record<string, unknown>,
	orders: createMockOrderResponse(),
	statuses: mockStatuses as Array<Record<string, unknown>>,
	broadcastAuth: {},
}

let activeMocks: ApiMockConfig = { ...defaultMocks }

const toResponse = <T,>(value: MockReply<T>): { statusCode: number; body: T } => {
	if (
		typeof value === 'object' &&
		value !== null &&
		'statusCode' in value &&
		'body' in value
	) {
		return value as { statusCode: number; body: T }
	}

	return { statusCode: 200, body: value as T }
}

const registerApiMocks = (overrides: Partial<ApiMockConfig> = {}) => {
	activeMocks = { ...activeMocks, ...overrides }
	const mocks: ApiMockConfig = activeMocks

	const replyWithMockApi = (req: Cypress.Request) => {
	const { method, url } = req

	if (method === 'GET' && url.includes('/api/account/me')) {
		req.reply(toResponse(mocks.me))
		return
	}

	if (method === 'POST' && url.includes('/api/account/login')) {
		req.reply(toResponse(mocks.login))
		return
	}

	if (method === 'POST' && url.includes('/api/account/logout')) {
		req.reply(toResponse(mocks.logout))
		return
	}

	if (method === 'GET' && url.includes('/api/payment/stripe-key')) {
		req.reply(toResponse(mocks.stripeKey))
		return
	}

	if (method === 'POST' && url.includes('/api/payment/checkout')) {
		req.reply(toResponse(mocks.checkout))
		return
	}

	if (method === 'GET' && url.includes('/api/categories')) {
		req.reply(toResponse(mocks.categories))
		return
	}

	if (method === 'GET' && url.includes('/api/items')) {
		if (/\/api\/items\/\d+$/.test(url)) {
			req.reply(toResponse(mocks.itemById))
			return
		}

		req.reply(toResponse(mocks.items))
		return
	}

	if (method === 'GET' && url.includes('/api/orders/active')) {
		req.reply(toResponse(mocks.activeOrders))
		return
	}

	if (method === 'GET' && url.includes('/api/orders/breaks/')) {
		req.reply(toResponse(mocks.breaks))
		return
	}

	if (method === 'GET' && /\/api\/orders\/\d+$/.test(url)) {
		req.reply(toResponse(mocks.orderById))
		return
	}

	if (method === 'GET' && url.includes('/api/orders')) {
		req.reply(toResponse(mocks.orders))
		return
	}

	if (method === 'GET' && url.includes('/api/statuses')) {
		req.reply(toResponse(mocks.statuses))
		return
	}

	if (url.includes('/broadcasting/auth')) {
		req.reply(toResponse(mocks.broadcastAuth))
		return
	}

	if (method === 'GET') {
		req.reply({ statusCode: 200, body: {} })
		return
	}

	req.reply({ statusCode: 200, body: {} })
}

	cy.intercept('https://bufeapi.jcloud.jedlik.cloud/**', (req) => {
		replyWithMockApi(req)
	}).as('mockAllBackendRequests')

	cy.intercept('**/api/**', (req) => {
		replyWithMockApi(req)
	}).as('mockAnyApiHost')

	// Keep common endpoint aliases for existing tests.
	cy.intercept('POST', '**/account/login', toResponse(mocks.login)).as('mockLoginDefault')
	cy.intercept('GET', '**/account/me', toResponse(mocks.me)).as('mockMeDefault')
	cy.intercept('GET', '**/payment/stripe-key', toResponse(mocks.stripeKey)).as('mockStripeKeyDefault')
}

Cypress.Commands.add('mockApi', (overrides: Partial<ApiMockConfig> = {}) => {
	registerApiMocks(overrides)
})

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
	activeMocks = { ...defaultMocks }
	cy.mockApi()
})