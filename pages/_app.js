import '../styles/globals.css'
import Image from 'next/image'

import { createClient, Provider } from 'urql';

const client = createClient({
  url: 'https://api.thegraph.com/subgraphs/name/dabit3/zoranftsubgraph'
})


function MyApp({ Component, pageProps }) {
  return (
    <Provider value={client}>
      <div>
        <nav>
          <div
            className="pt-4 pb-2 px-10 border-b"
          >
            <Image src="/icon.svg" height={50} width={50} />
          </div>
        </nav>
        <Component {...pageProps} />
      </div>
    </Provider>
  )
}

export default MyApp
