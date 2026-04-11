# networking

Only generic transport abstractions belong here: clients, interceptors, retries, and error mapping.

The only concrete endpoints allowed here are documented public storefront contracts owned by core, such as:

- `/api/store/context`
- `/api/themes/active`
- stable storefront catalog/cart/order paths used for reference-host diagnostics

Theme-private, tenant-private, or product-private endpoints must stay out of the public foundation.
