import ImageKit from "imagekit";

const PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY;
const PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
const URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT;

if (!PUBLIC_KEY || !PRIVATE_KEY || !URL_ENDPOINT) {
  // Defer throwing until used in server runtime; helpful for front-end imports.
  // But log a warning in development.
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.warn("ImageKit environment variables missing: IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT");
  }
}

const imagekit = new ImageKit({
  publicKey: PUBLIC_KEY,
  privateKey: PRIVATE_KEY,
  urlEndpoint: URL_ENDPOINT,
});


export default imagekit;
