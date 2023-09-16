# jsonwebtokens

-/login
provide user credentials in format {username: "john doe"} and get the access and refresh tokens. Where access token has some expiry time.

-/posts
use the access token to hit this route and get the post for the corresponsding user. You will get forbidden message if the access token has expired.

-/token
use the refresh token to get the new access token.
