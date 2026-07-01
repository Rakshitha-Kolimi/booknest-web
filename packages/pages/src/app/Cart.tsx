import { type OrderView, type PaymentMethod } from '@booknest/services'
import { formatPrice } from '@booknest/utils'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import { usePageTitle } from '../PageTitleProvider'
import {
  getQueryErrorMessage,
  useCartQuery,
  useCheckoutMutation,
  useClearCartMutation,
  useConfirmPaymentMutation,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from '../query/hooks'

const paymentMethods: PaymentMethod[] = [
  'COD',
  'UPI',
  'CREDIT_CARD',
  'DEBIT_CARD',
  'NET_BANKING',
]

export default function Cart(): React.ReactElement {
  usePageTitle('Cart')

  // Initialise local checkout state before wiring mutations into the UI.
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI')
  const [pendingOrder, setPendingOrder] = useState<OrderView | null>(null)

  // Call query functions before computing the cart request state.
  const cartQuery = useCartQuery()
  const updateCartItemMutation = useUpdateCartItemMutation()
  const removeCartItemMutation = useRemoveCartItemMutation()
  const clearCartMutation = useClearCartMutation()
  const checkoutMutation = useCheckoutMutation()
  const confirmPaymentMutation = useConfirmPaymentMutation()
  const cart = cartQuery.data ?? null
  const loading = cartQuery.isLoading
  const error = cartQuery.isError
    ? getQueryErrorMessage(cartQuery.error, 'Failed to load cart')
    : updateCartItemMutation.isError
      ? getQueryErrorMessage(
          updateCartItemMutation.error,
          'Unable to update quantity'
        )
      : removeCartItemMutation.isError
        ? getQueryErrorMessage(
            removeCartItemMutation.error,
            'Unable to remove item'
          )
        : clearCartMutation.isError
          ? getQueryErrorMessage(
              clearCartMutation.error,
              'Unable to clear cart'
            )
          : checkoutMutation.isError
            ? getQueryErrorMessage(checkoutMutation.error, 'Checkout failed')
            : confirmPaymentMutation.isError
              ? getQueryErrorMessage(
                  confirmPaymentMutation.error,
                  'Payment confirmation failed'
                )
              : ''

  const handleQuantity = async (bookId: string, count: number) => {
    if (count < 1) return

    try {
      await updateCartItemMutation.mutateAsync({ bookId, count })
    } catch {
      return
    }
  }

  const handleRemove = async (bookId: string) => {
    try {
      await removeCartItemMutation.mutateAsync(bookId)
    } catch {
      return
    }
  }

  const handleClear = async () => {
    try {
      await clearCartMutation.mutateAsync()
    } catch {
      return
    }
  }

  const handleCheckout = async () => {
    try {
      const order = await checkoutMutation.mutateAsync(paymentMethod)
      setPendingOrder(order)
    } catch {
      return
    }
  }

  const handlePaymentResult = async (success: boolean) => {
    if (!pendingOrder) return

    try {
      const updated = await confirmPaymentMutation.mutateAsync({
        orderId: pendingOrder.order.id,
        success,
      })
      setPendingOrder(updated)
    } catch {
      return
    }
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">My Cart</h1>
        <p className="text-sm text-zinc-600">
          Review your selected books, checkout, and confirm payment.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bn-card-solid rounded-xl p-6 text-sm text-zinc-600">
          Loading cart...
        </div>
      ) : !cart || cart.items.length === 0 ? (
        <div className="bn-card-solid rounded-xl p-6">
          <p className="text-sm text-zinc-600">Your cart is empty.</p>
          <Link
            to="/books"
            className="bn-button mt-3 inline-flex px-3 py-2 text-sm"
          >
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            {cart.items.map((item) => (
              <article
                key={item.book_id}
                className="bn-card-solid rounded-xl p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link to={`/books/${item.book_id}`} className="block">
                    <h2 className="text-base font-semibold text-zinc-900">
                      {item.name}
                    </h2>
                    <p className="text-sm text-zinc-600">{item.author_name}</p>
                    <p className="text-sm text-zinc-600">
                      {formatPrice(item.unit_price)} each
                    </p>
                  </Link>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        void handleQuantity(item.book_id, item.count - 1)
                      }
                      className="rounded-lg border border-orange-200 bg-orange-50 px-2 py-1 text-sm text-orange-900"
                      disabled={item.count <= 1}
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.count}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        void handleQuantity(item.book_id, item.count + 1)
                      }
                      className="rounded-lg border border-orange-200 bg-orange-50 px-2 py-1 text-sm text-orange-900"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleRemove(item.book_id)}
                      className="ml-2 rounded-lg border border-rose-300 px-2 py-1 text-sm text-rose-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-sm font-medium text-zinc-900">
                  Line Total: {formatPrice(item.line_total)}
                </p>
              </article>
            ))}

            <button
              type="button"
              onClick={() => void handleClear()}
              className="rounded-lg border border-zinc-300 bg-white/80 px-3 py-2 text-sm font-medium text-zinc-700"
            >
              Clear Cart
            </button>
          </div>

          <aside className="bn-card-solid rounded-xl p-5">
            <h2 className="text-lg font-semibold text-zinc-900">Checkout</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Total items: {cart.total_items}
            </p>
            <p className="text-xl font-semibold text-zinc-900">
              {formatPrice(cart.subtotal)}
            </p>

            <label
              htmlFor="paymentMethodSelect"
              className="mt-4 block text-sm font-medium text-zinc-700"
            >
              Payment Method
            </label>
            <select
              id="paymentMethodSelect"
              name="paymentMethod"
              value={paymentMethod}
              onChange={(e) =>
                handlePaymentResult(e.target.value === 'credit_card')
              }
              className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="credit_card" selected>
                Card
              </option>
              <option value="bank_account">Bank Transfer</option>
            </select>
            <select
              value={paymentMethod}
              onChange={(event) =>
                setPaymentMethod(event.target.value as PaymentMethod)
              }
              className="bn-input mt-1 w-full px-3 py-2 text-sm"
            >
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => void handleCheckout()}
              disabled={checkoutMutation.isPending}
              className="bn-button mt-4 w-full px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checkoutMutation.isPending ? 'Placing order...' : 'Place Order'}
            </button>

            {pendingOrder && (
              <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                <p className="text-sm font-semibold text-zinc-900">
                  Order #{pendingOrder.order.order_number}
                </p>
                <p className="text-xs text-zinc-600">
                  Status: {pendingOrder.order.status} | Payment:{' '}
                  {pendingOrder.order.payment_status || 'PENDING'}
                </p>

                {pendingOrder.order.status === 'PENDING' && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white"
                      onClick={() => void handlePaymentResult(true)}
                    >
                      Mark Payment Success
                    </button>
                    <button
                      type="button"
                      className="rounded-md bg-rose-600 px-3 py-1 text-xs font-medium text-white"
                      onClick={() => void handlePaymentResult(false)}
                    >
                      Mark Payment Failed
                    </button>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </section>
  )
}
