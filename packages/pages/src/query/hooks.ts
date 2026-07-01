import {
  addToCart,
  adminUpdateOrderStatus,
  type AuthorInput,
  AuthService,
  type BookInput,
  cancelOrder,
  checkout,
  clearCart,
  confirmPayment,
  createAuthor,
  createBook,
  createCategory,
  createPublisher,
  deleteAuthor,
  deleteBook,
  deleteCategory,
  deletePublisher,
  getBookById,
  getCart,
  getErrorMessage,
  getRecommendations,
  listAllOrders,
  listAuthors,
  type ListAuthorsParams,
  listBookReviews,
  listBooks,
  type ListBooksQueryParams,
  listCategories,
  listMyOrders,
  listPublishers,
  type ListPublishersParams,
  type PaymentMethod,
  type PublisherInput,
  queryBooks,
  removeCartItem,
  type ReviewInput,
  updateAuthor,
  updateBook,
  updateCartItem,
  updateCategory,
  updatePublisher,
  uploadBookImage,
  upsertBookReview,
} from '@booknest/services'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const queryKeys = {
  books: (params?: ListBooksQueryParams) => ['books', params] as const,
  book: (id: string) => ['book', id] as const,
  bookReviews: (id: string) => ['bookReviews', id] as const,
  recommendations: ['recommendations'] as const,
  cart: ['cart'] as const,
  myOrders: ['myOrders'] as const,
  allOrders: ['allOrders'] as const,
  userProfile: (userId: string) => ['userProfile', userId] as const,
  adminCatalog: ['adminCatalog'] as const,
  authors: (params?: ListAuthorsParams) => ['authors', params] as const,
  publishers: (params?: ListPublishersParams) =>
    ['publishers', params] as const,
  categories: ['categories'] as const,
}

export function getQueryErrorMessage(error: unknown, fallback: string): string {
  return getErrorMessage(error, fallback)
}

export function useBooksQuery(params: ListBooksQueryParams) {
  return useQuery({
    queryKey: queryKeys.books(params),
    queryFn: () => queryBooks(params),
  })
}

export function useBookQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.book(id),
    queryFn: () => getBookById(id),
    enabled: Boolean(id),
  })
}

export function useBookReviewsQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.bookReviews(id),
    queryFn: () => listBookReviews(id),
    enabled: Boolean(id),
  })
}

export function useRecommendationsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.recommendations,
    queryFn: () => getRecommendations(4),
    enabled,
  })
}

export function useAddToCartMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bookId, count }: { bookId: string; count: number }) =>
      addToCart(bookId, count),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart })
    },
  })
}

export function useUpsertBookReviewMutation(bookId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ReviewInput) => upsertBookReview(bookId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.bookReviews(bookId),
      })
      void queryClient.invalidateQueries({ queryKey: queryKeys.book(bookId) })
      void queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })
}

export function useCartQuery() {
  return useQuery({
    queryKey: queryKeys.cart,
    queryFn: getCart,
  })
}

export function useUpdateCartItemMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bookId, count }: { bookId: string; count: number }) =>
      updateCartItem(bookId, count),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart, cart)
    },
  })
}

export function useRemoveCartItemMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookId: string) => removeCartItem(bookId),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart, cart)
    },
  })
}

export function useClearCartMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart })
    },
  })
}

export function useCheckoutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (paymentMethod: PaymentMethod) => checkout(paymentMethod),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart })
      void queryClient.invalidateQueries({ queryKey: queryKeys.myOrders })
    },
  })
}

export function useConfirmPaymentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, success }: { orderId: string; success: boolean }) =>
      confirmPayment(orderId, success),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart })
      void queryClient.invalidateQueries({ queryKey: queryKeys.myOrders })
      void queryClient.invalidateQueries({ queryKey: queryKeys.allOrders })
    },
  })
}

export function useMyOrdersQuery() {
  return useQuery({
    queryKey: queryKeys.myOrders,
    queryFn: listMyOrders,
  })
}

export function useAllOrdersQuery() {
  return useQuery({
    queryKey: queryKeys.allOrders,
    queryFn: listAllOrders,
  })
}

export function useCancelOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      orderId,
      cancellationReason,
    }: {
      orderId: string
      cancellationReason: string
    }) => cancelOrder(orderId, cancellationReason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myOrders })
      void queryClient.invalidateQueries({ queryKey: queryKeys.allOrders })
    },
  })
}

export function useAdminUpdateOrderStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      orderId,
      payload,
    }: {
      orderId: string
      payload: {
        status?: 'COMPLETED' | 'CANCELLED'
        payment_status?: 'REFUNDED'
        cancellation_reason?: string
      }
    }) => adminUpdateOrderStatus(orderId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.allOrders })
      void queryClient.invalidateQueries({ queryKey: queryKeys.myOrders })
    },
  })
}

export function useUserProfileQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.userProfile(userId),
    queryFn: () => AuthService.getUser(userId),
    enabled: Boolean(userId),
  })
}

export function useResendEmailVerificationMutation() {
  return useMutation({
    mutationFn: (email?: string) => AuthService.resendEmailVerification(email),
  })
}

export function useResendMobileOtpMutation() {
  return useMutation({
    mutationFn: AuthService.resendMobileOTP,
  })
}

export function useVerifyMobileMutation(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (otp: string) => AuthService.verifyMobile(otp),
    onSuccess: () => {
      if (userId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.userProfile(userId),
        })
      }
    },
  })
}

export function useUpdateUserPreferencesMutation(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AuthService.IUserPreferencesInput) =>
      AuthService.updateUserPreferences(userId, input),
    onSuccess: () => {
      if (userId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.userProfile(userId),
        })
      }
    },
  })
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: (input: AuthService.ILoginInput) => AuthService.login(input),
  })
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (input: AuthService.IRegisterInput) =>
      AuthService.register(input),
  })
}

export function useRegisterAdminMutation() {
  return useMutation({
    mutationFn: (input: AuthService.IAdminRegisterInput) =>
      AuthService.registerAdmin(input),
  })
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (input: AuthService.IForgotPasswordInput) =>
      AuthService.forgotPassword(input),
  })
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: ({
      token,
      newPassword,
    }: {
      token: string
      newPassword: string
    }) => AuthService.resetPasswordWithToken(token, newPassword),
  })
}

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: (token: string) => AuthService.verifyEmail(token),
  })
}

export function useAdminCatalogQuery() {
  return useQuery({
    queryKey: queryKeys.adminCatalog,
    queryFn: async () => {
      const [books, authors, publishers, categories] = await Promise.all([
        listBooks(),
        listAuthors({ limit: 500 }),
        listPublishers({ limit: 500 }),
        listCategories(),
      ])

      return { books, authors, publishers, categories }
    },
  })
}

export function useCreateBookMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BookInput) => createBook(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminCatalog })
      void queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })
}

export function useUpdateBookMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: BookInput }) =>
      updateBook(id, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminCatalog })
      void queryClient.invalidateQueries({ queryKey: ['books'] })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.book(variables.id),
      })
    },
  })
}

export function useDeleteBookMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteBook(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminCatalog })
      void queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })
}

export function useUploadBookImageMutation() {
  return useMutation({
    mutationFn: (image: File) => uploadBookImage(image),
  })
}

export function useCreateAuthorMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: AuthorInput) => createAuthor(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminCatalog })
    },
  })
}

export function useUpdateAuthorMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AuthorInput }) =>
      updateAuthor(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminCatalog })
    },
  })
}

export function useDeleteAuthorMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteAuthor(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminCatalog })
    },
  })
}

export function useCreatePublisherMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: PublisherInput) => createPublisher(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminCatalog })
    },
  })
}

export function useUpdatePublisherMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PublisherInput }) =>
      updatePublisher(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminCatalog })
    },
  })
}

export function useDeletePublisherMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deletePublisher(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminCatalog })
    },
  })
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ name }: { name: string }) => createCategory({ name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminCatalog })
    },
  })
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateCategory(id, { name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminCatalog })
    },
  })
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminCatalog })
    },
  })
}
