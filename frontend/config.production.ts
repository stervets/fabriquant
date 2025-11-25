console.log('Using production environment');
export default {
    mode: 'prod',
    httpEndpoint: 'https://trade.core5.ru:8888/graphql',
    wsEndpoint: 'wss://trade.core5.ru:8888/graphql'
}
