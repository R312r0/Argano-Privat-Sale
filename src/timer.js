import React, {useEffect, useState} from "react";
import moment from 'moment-timezone';
export const Timer = () => {


    const countDownDate = moment("Oct 1, 2021 21:00:00");
    countDownDate.tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('ha z')

    const calculateTimeLeft = () => {

    let now = moment();
    let distance = countDownDate._d - now._d;

    const timeLeft = {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000)
    }  

    return timeLeft;
  }

  console.log()

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
      const timer = setTimeout(() => {
        setTimeLeft(calculateTimeLeft())
      }, 1000)

      return () => clearTimeout(timer);

    })

    return (
        <div className='app__header__timer'> 
        <div className='app__header__timer__time'> <div> {timeLeft.days} </div> <span> Days </span> <span className='divider'> : </span> </div>
        <div className='app__header__timer__time'> <div> {timeLeft.hours} </div> <span> Hours </span> <span className='divider'> : </span> </div>
        <div className='app__header__timer__time'>  <div> {timeLeft.minutes} </div> <span> Min </span> <span className='divider'> : </span> </div>
        <div className='app__header__timer__time'>  <div> {timeLeft.seconds} </div>  <span> Sec </span> </div>
      </div>
    )

}

export default React.memo(Timer);