import React, {useState, useEffect} from 'react';
import ago_logo from './assets/images/ago-logo.svg';
import { Timer } from './timer';
import tether from './assets/images/tether.svg';
import SALE_ABI from './abi/abi.json';
import ERC20_ABI from './abi/erc20.json';
import { Progress, message } from 'antd';
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core';
import { InjectedConnector, NoEthereumProviderError, UserRejectedRequestError } from '@web3-react/injected-connector';
import { network } from './helpers';
import moment from 'moment-timezone';
import useWindowDimensions from './helpers';

import './app.scss';
import './reset.scss';

function App() {

  const presaleAddress = "0x16b6fE45d791faD5993eaF7FbDc015346b582743";
  const usdtAddress = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f";
  const agoAddress = "0x4e125214Db26128B35c24c66113C63A83029e433"

  const {width, height} = useWindowDimensions();
  const {activate, account, active, library, error} = useWeb3React();

  const [usdtValue, setUsdtValue] = useState(0);
  const [tokensApproved, setTokensApproved] = useState(undefined);
  const [usdtContract, setUsdtContract] = useState(null);
  const [presaleContract, setPresaleContract] = useState(null);
  const [agoContract, setAgoContract] = useState(null);
  const [tokensLeft, setTokenLeft] = useState(0);
  const [disableInput, setDisableInput] = useState(false);


  const whiteListEndsUniversal = moment("Sept 28, 2021 18:00:00");
  const privatSaleStarts = moment("Sept 28, 2021 18:30:00");
  const privatSaleEnds = moment("Oct 1, 2021, 21:00:00");
  whiteListEndsUniversal.tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('ha z');
  privatSaleStarts.tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('ha z');
  privatSaleEnds.tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('ha z');

  const metaMask = new InjectedConnector({ supportedChainIds: [137] })

  const onFinnalyApprove = () => {
    message.success({content: "Successfully approved", key: "lol", duration: 3, className: "ant-argano-message"});
    setTokensApproved(true);
  }

  const onFinnalyBuyAgo = () => {
    message.success({key: "buy", content: "Successfully buy AGO token", duration: 5, className: "ant-argano-message"})
  }

  useEffect(() => {
    metaMask.isAuthorized().then((res) => {
      if (res) {
        activate(metaMask);
      }
      else {
        activate(network);
      }
    })
  }, [])

  useEffect(() => {

    if (error instanceof NoEthereumProviderError) {
      message.error({content: "You'r browser does not have a MetaMask installed", key: "connect", duration: 99999, className: "ant-argano-message"});
      setDisableInput(true);
    }

    else if (error instanceof UnsupportedChainIdError) {
      message.error({content: "You choosed wrong network, please switch it to Polygon!", key: "errors", duration: 9999999, className: "ant-argano-message"})
      setDisableInput(true);
    }

    else if (error instanceof UserRejectedRequestError) {
      message.error({content: "You rejected request", duration: 5, key: "connect", className: "ant-argano-message"})
    }

    else {
      message.success({content: "Everything OK", duration: 3, key: "errors", className: "ant-argano-message"})
      setDisableInput(false);
    }
  }, [error])


  useEffect(() => {


    if (active) {
      const usdt = new library.eth.Contract(ERC20_ABI, usdtAddress);
      const presale = new library.eth.Contract(SALE_ABI, presaleAddress);
      const ago = new library.eth.Contract(ERC20_ABI, agoAddress);

      setUsdtContract(usdt);
      setPresaleContract(presale);
      setAgoContract(ago);

      if (account) {
        usdt.methods.allowance(account, presaleAddress).call().then((res) => {
          if (res >= 5000 * 1e6) {
            setTokensApproved(true);
          }
          else {
            setTokensApproved(false);
          }
        });
      }
    }
  }, [active])

  useEffect(() => {

    if (usdtContract && presaleContract && account) {

      usdtContract.methods.allowance(account, presaleAddress).call()
      .then((res) => {
        if (res >= (5000 * 1e6)) {
          setTokensApproved(true)
        }
        else {
          setTokensApproved(false)
        }  
      })
      agoContract.methods.balanceOf(presaleAddress).call().then((res) => setTokenLeft(res / 1e18))
    }
    else if (usdtContract && presaleContract && !account) {
      agoContract.methods.balanceOf(presaleAddress).call().then((res) => setTokenLeft(res / 1e18))
    }
  }, [usdtContract, presaleContract, agoContract, active, account])

  const onErrorApprove = (e) => {

    if (e.code === 4001) {
      message.error({content: "You denied transaction!", key: "lol", duration: 10000, className: "ant-argano-message"})
    }
    else {
      message.error({content: "Some error occured please reload page!", key: "lol", duration: 10000, className: "ant-argano-message"})
    }
  }

  const approve = async () => {
    try {
      message.loading({content: "Approve your USDT", key: "lol", duration: 10000, className: "ant-argano-message"})
      await usdtContract.methods.approve(presaleAddress, 5000 * 1e6).send({from: account});
      onFinnalyApprove();
    }
    catch(e) {
      onErrorApprove(e)
    }
  }


  const onError = (e) => {
    if (e.code === 4001) {
      message.error({key: "buy", content: "You denied buy transaction!", duration: 5, className: "ant-argano-message"});
    }
    else {
      message.error({key: "buy", content: "Some error occured please reload page", duration: 5, className: "ant-argano-message"});
    }
  }


  const buyAgo = async () => {

    if (usdtValue < 100) {
      message.error({content: "Mimimal value is 100$.", className: "ant-argano-message"})
      return
    }

    if (usdtValue > 5000) {
      message.error({content: "Maximum value is 5000$.", className: "ant-argano-message"})
      return
    }

    try {
      message.loading({key: "buy", content: "Proccessing buy", duration: 9999999, className: "ant-argano-message"})
      await presaleContract.methods.buyByUsdt(usdtValue * 1e6).send({from: account});
      onFinnalyBuyAgo();
    }
    catch(e) {
      onError(e);
    }
  }


  const auth = async () => {
    try {
      message.loading({key: "connect", content: "Connecting your wallet", duration: 9999999, className: "ant-argano-message"})
      await activate(metaMask);
    }
    catch(e) {
      message.error({key: "connect", content: "Some error occured", duration: 5, className: "ant-argano-message"})
    }
    finally {
      message.success({key: "connect", content: "Successfully connected", duration: 5, className: "ant-argano-message"})
    }
  }

  const MainButton = () => {

    if (active && account) {
      if (tokensApproved) {
        return <button onClick={() => buyAgo()}> Buy AGO! </button>
      }
      else {
        return <button onClick={() => approve()}> Approve </button>
      }
    }
    else {
      return <button onClick={() => auth()}> Connect wallet </button>
    }
  }

  const calculateProgress = (a, b) => {

    const distance = a - b;
    
    const precent = ((distance / a) * 100) * 10; // TODO: for true should be not * 10; Cut it.

    return precent;

  }

  return (
    <>
    <div className="app">
        <div className='app__header'> 
          <img src={ago_logo}/>
            <Timer/>
          <button><a href="https://www.argano.io/"> Go back </a> </button>
        </div>
        <div className='app__amout-progress-bar'> 
          <h3> Token distributed </h3>
          <div className="app__amout-progress-bar__bar">
            <Progress strokeColor={"#40BA93"} status='active' type="line" strokeWidth={width < 768 ? 15 : 20} percent={calculateProgress(2000000, tokensLeft)} showInfo={false}/>
          </div>
        </div>
        <div className='app__body-swap'> 
          <div className='app__body-swap__token-info'>
            <span> Token information </span>
            <span> <p>Name</p> <b> Argano governance token </b> </span>
            <span> <p>Token Ticker </p> <b> AGO </b> </span>
            <span> <p>Total Supply </p> <b> 65,000,000 </b> </span>
            <span> <p>Decimals </p> <b> 18 </b> </span>
            <span> <p>Token address </p> <b> <a href='https://polygonscan.com/address/0x4e125214Db26128B35c24c66113C63A83029e433' target="_blank"> 0x4e125214... <i className="fas fa-arrow-right"></i> </a> </b> </span>
          </div>
          <div className='app__body-swap__token-swap' style={{pointerEvents: disableInput ? "none" : "all"}}>
            {disableInput ? 
                        <div className='error-disabled'> 
                        </div>
                        :
                        ""
            }
            <div style={{visibility: !tokensApproved ? "hidden" : "visible"}} > 
              <p> You are paying </p>
              <input style={{visibility: disableInput || !tokensApproved ? "hidden" : "visible"}} min={100} max={5000} type="number" placeholder="Enter amount" value={usdtValue} onChange={(e) => setUsdtValue(e.target.value)} />
              <span><img src={tether}/> USDT  </span>
            </div> 
            <MainButton/>
          </div>
          <div className='app__body-swap__sale-details'>
            <span> Sale details </span>
            <span> <p>Access type</p> <b> Private sale </b> </span>
            <span> <p>Token price </p> <b> $0.45 </b> </span>
            <span> <p> Purchase range </p> <b> $100-$5,000 </b> </span>
            <span> <p>Start time </p> <b> {privatSaleStarts._d.getDate()} {privatSaleStarts._locale._months[privatSaleStarts._d.getMonth()].slice(0, 3)} {privatSaleStarts._d.getHours()}:{privatSaleStarts._d.getMinutes() < 10 ? "0"+privatSaleStarts._d.getMinutes():privatSaleStarts._d.getMinutes()} {Intl.DateTimeFormat().resolvedOptions().timeZone} </b> </span>
            <span> <p> End time </p> <b> {privatSaleEnds._d.getDate()} {privatSaleEnds._locale._months[privatSaleEnds._d.getMonth()].slice(0, 3)} {privatSaleEnds._d.getHours() < 10 ? "0"+privatSaleEnds._d.getHours(): privatSaleEnds._d.getHours()}:{privatSaleEnds._d.getMinutes() < 10 ? "0"+privatSaleEnds._d.getMinutes():privatSaleEnds._d.getMinutes()} {Intl.DateTimeFormat().resolvedOptions().timeZone}  </b> </span>
            <span> <p> Claim </p> <b> automatic distribution </b> </span>
          </div>
        </div>
        <div className='app__bottom-sec'> 
          <div className='app__bottom-sec__copyright'> 
            <p> <img src={ago_logo}/> ARGANO </p>
            <p> Copyright @ Argano Team 2021 </p>
          </div>
          <div className='app__bottom-sec__note-block'>
          <p> Note: </p>
              <p> 1. You are available to purchase AGO token if your address was whitelisted earlier in the appropriate form. </p>
              <p> 2. Protocol accepts deposits only in the following allocation range: $100 - $5,000. In case the depositing amount goes beyond this limit, your transaction will be automatically reverted. </p>
              <p> 3. You are available to perform a purchase as many times as you want from your whitelisted address. Any additional attempts to purchase tokens will be accepted, however, take into consideration that the maximum investment size stays untouchable and equals $5,000. </p>  
          </div>
          <div className='app__bottom-sec__social-medias'>
            <div>
              <a href="https://github.com/Argano-DEX/Argano-Contracts" target="_blank"><i className="fab fa-github"></i></a>
              <a href="https://argano.medium.com/" target="_blank"><i className="fab fa-medium"></i> </a>
              <a href="https://twitter.com/argano_io" target="_blank"><i className="fab fa-twitter"></i> </a>
              <a href="https://discord.com/invite/mH7PJnNCWP" target="_blank"><i className="fab fa-discord"></i> </a>
              <a href="https://t.me/ARGANO_DEFI" target="_blank"><i className="fab fa-telegram-plane"></i> </a>
              <a href="mailto:email@argano.io" target="_blank"><i className="far fa-envelope"></i> </a>
            </div>
          </div>
        </div>
    </div>
    </>
  );
}

export default App;
