import { createStorefrontClient, InMemoryCache, type Storefront } from '@shopify/hydrogen';

/**
 * Helper to create a Storefront client for customer operations.
 */
function getStorefront(env: Record<string, string | undefined>) {
  const { storefront } = createStorefrontClient({
    cache: new InMemoryCache(),
    waitUntil: undefined,
    i18n: { language: 'EN', country: 'US' },
    publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN!,
    storeDomain: env.PUBLIC_STORE_DOMAIN!,
  });
  return storefront;
}

/**
 * Create a customer access token for login.
 */
export async function createCustomerAccessToken(
  email: string,
  password: string,
  env: Record<string, string | undefined>
) {
  const storefront = getStorefront(env);
  const result = await storefront.mutate(`
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `, {
    variables: { input: { email, password } },
  });
  return result.customerAccessTokenCreate;
}

/**
 * Delete a customer access token for logout.
 */
export async function deleteCustomerAccessToken(
  token: string,
  env: Record<string, string | undefined>
) {
  const storefront = getStorefront(env);
  const result = await storefront.mutate(`
    mutation customerAccessTokenDelete($customerAccessToken: String!) {
      customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
        deletedAccessToken
        deletedCustomerAccessTokenId
        userErrors {
          field
          message
        }
      }
    }
  `, {
    variables: { customerAccessToken: token },
  });
  return result.customerAccessTokenDelete;
}

/**
 * Renew an expiring customer access token.
 */
export async function renewCustomerAccessToken(
  token: string,
  env: Record<string, string | undefined>
) {
  const storefront = getStorefront(env);
  const result = await storefront.mutate(`
    mutation customerAccessTokenRenew($customerAccessToken: String!) {
      customerAccessTokenRenew(customerAccessToken: $customerAccessToken) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        userErrors {
          field
          message
        }
      }
    }
  `, {
    variables: { customerAccessToken: token },
  });
  return result.customerAccessTokenRenew;
}

/**
 * Create a new customer account.
 */
export async function createCustomer(
  env: Record<string, string | undefined>,
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
) {
  const storefront = getStorefront(env);
  const result = await storefront.mutate(`
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          email
          firstName
          lastName
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `, {
    variables: {
      input: {
        email,
        password,
        firstName,
        lastName,
      },
    },
  });
  return result.customerCreate;
}

/**
 * Send a password recovery email.
 */
export async function recoverCustomer(
  email: string,
  env: Record<string, string | undefined>
) {
  const storefront = getStorefront(env);
  const result = await storefront.mutate(`
    mutation customerRecover($email: String!) {
      customerRecover(email: $email) {
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `, {
    variables: { email },
  });
  return result.customerRecover;
}

/**
 * Update customer details.
 */
export async function updateCustomer(
  token: string,
  updates: { firstName?: string; lastName?: string; email?: string; password?: string },
  env: Record<string, string | undefined>
) {
  const storefront = getStorefront(env);
  const result = await storefront.mutate(`
    mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
      customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
        customer {
          id
          email
          firstName
          lastName
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `, {
    variables: {
      customerAccessToken: token,
      customer: updates,
    },
  });
  return result.customerUpdate;
}

/**
 * Get customer details.
 */
export async function getCustomer(
  token: string,
  env: Record<string, string | undefined>
) {
  const storefront = getStorefront(env);
  const result = await storefront.query(`
    query getCustomer($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id
        email
        firstName
        lastName
        orders(first: 10) {
          edges {
            node {
              id
              orderNumber
              totalPrice {
                amount
                currencyCode
              }
              processedAt
            }
          }
        }
      }
    }
  `, {
    variables: { customerAccessToken: token },
  });
  return result.customer;
}
