declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string
      DATABASE_CLIENT: string
      DATABASE_URL: string
    }
  }
}

export {}
