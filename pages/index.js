import Head from 'next/head'
import styles from '../styles/Home.module.css'
import React from 'react'
import { utils } from 'ethers'

import { createClient } from 'urql';

const client = createClient({
  url: 'https://api.thegraph.com/subgraphs/name/dabit3/foundationtry1'
})

// const tokensQuery = `
//   query {
//     tokens(
//       orderBy: createdAtTimestamp
//       orderDirection: desc
//       first: 10
//     ) {
//       id
//       tokenID
//       contentURI
//       metadataURI
//     }
//   }
// `

// const tokensQuery = `
//   query($first: Int, $orderBy: BigInt, $orderDirection: String) {
//     tokens(
//       first: $first, orderBy: $orderBy, orderDirection: $orderDirection
//     ) {
//       id
//       tokenID
//       contentURI
//       metadataURI
//     }
//   }
// `

const tokensQuery = `
  query {
    tokens(first: 30) {
      id
      tokenID
      contentURI
      tokenIPFSPath
    }
  }
`

const tokenAuctionQuery = `
  query {
    nftmarketAuctions(
      first: 35
      
      ) {
      id
      token {
        id
        tokenIPFSPath
        contentURI
      }
      reservePrice
    }
  }
`

async function fetchData() {  
  const data = await client.query(tokensQuery).toPromise();

  const auctions = await client.query(tokenAuctionQuery).toPromise()
  console.log('auctions: ', auctions)

  const auctionData = await Promise.all(auctions.data.nftmarketAuctions.map(async auction => {
    let meta;
    try {
      meta = await (await fetch(auction.token.contentURI)).json()
      console.log('auction meta: ', meta)
    } catch (err) {
    }
    if (!meta) return
    if (meta.image.includes('mp4')) {
      auction.type = 'video'
    }
    else if (meta.image.includes('wav')) {
      auction.type = 'audio'
    }
    else {
      auction.type = 'image'
    }
    auction.contentURI = meta.image.replace('ipfs://', 'https://ipfs.foundation.app/')
    auction.meta = meta
    return auction
  }))

  // const tokenData = await Promise.all(data.data.tokens.map(async token => {
  //   let meta;
  //   try {
  //     meta = await (await fetch(token.contentURI)).json()
  //   } catch (err) {
  //   }

  //   if (!meta) return

  //   if (meta.image.includes('mp4')) {
  //     token.type = 'video'
  //   }
  //   else if (meta.image.includes('wav')) {
  //     token.type = 'audio'
  //   }
  //   else {
  //     token.type = 'image'
  //   }
  //   token.contentURI = meta.image.replace('ipfs://', 'https://ipfs.foundation.app/')
  //   token.meta = meta
  //   return token
  // }))
  return auctionData
}

export default function Home(props) {
  console.log('props: ', props)
  if (props && props.tokens && props.tokens.length) return (
    <div className="grid grid-cols-4 gap-4 px-10 py-10">
      {
        props.tokens.map(token => {
          return (
            <div className="shadow-lg bg-transparent rounded-2xl overflow-hidden">
              <div key={token.contentURI}
                className="w-100% h-100%"
              >
                {
                  token.type === 'image' && (
                    <div style={{height: '320px', overflow: 'hidden'}}>
                      <img style={{ minHeight: '320px' }} src={token.contentURI} />
                    </div>
                  )
                }
                {
                  token.type === 'video' && (
                    <div className="relative">
                      <div style={{width: '288px', height: '320px', boxSizing: 'border-box'}} />
                      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}>
                        <video height="auto" controls autoPlay
                        style={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          display: 'block',
                          objectFit: 'cover'
                        }}>
                          <source src={token.contentURI} />
                        </video>
                      </div>
                    </div>
                  )
                }
                {
                  token.type === 'audio' && (
                    <audio controls>
                      <source src={token.contentURI} type="audio/ogg" />
                      <source src={token.contentURI} type="audio/mpeg" />
                    Your browser does not support the audio element.
                    </audio>
                  )
                }
                <div className="px-2 pt-2 pb-10">
                  <h3
                  style={{ height: 100 }}
                  className="text-2xl p-4 pt-6 font-semibold">{token.meta.name}</h3>
                </div>
              </div>
              <div className="bg-black p-10">
                <p className="text-white">
                  Price
                </p>
                <p className="text-white font-bold text-xl">
                  {utils.formatEther(token.reservePrice)}
                </p>
              </div>
            </div>
          )
        })
      }
    </div>
  )
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>
      </main>
    </div>
  )
}

export async function getServerSideProps() {
  const data = await fetchData()
  return {
    props: {
      tokens: data
    }
  }
}
