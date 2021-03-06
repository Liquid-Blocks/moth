import React, {useState, useEffect} from 'react';
import getBlockchain from '../ethereum';
import SideBarCount from '../components/SideBarCount';
import SideBarLive from '../components/SideBarLive';
import NavBarCount from '../components/NavBarCount';
import NavBarLive from '../components/NavBarLive';
import HeroSectionLive from '../components/HeroSectionLive';
import Footer from '../components/Footer';
import AboutSectionCount from '../components/AboutSectionCount';
import AboutSectionLive from '../components/AboutSectionLive';
import WhitepaperSection from '../components/WhitepaperSection';
import DiscoverSection from '../components/DiscoverSection';
import MothSection from '../components/MothSection';
import LogoSection from '../components/LogoSection';
import CreatorSection from '../components/CreatorSection';
import { ethers } from 'ethers'

import detectEthereumProvider from '@metamask/detect-provider';

const Home = () => {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => {setIsOpen(!isOpen)};

    const [user, setUser] = useState(undefined);
    const [moth, setMoth] = useState(undefined); 							
    const [mothMaster, setMothMaster] = useState(undefined);
    const [userBal, setUserBal] = useState(undefined);
    const [lastClaim, setLastClaim] = useState(undefined);

    const [timerDays, setTimerDays] = useState();
    const [timerHours, setTimerHours] = useState();
    const [timerMinutes, setTimerMinutes] = useState();
    const [timerSeconds, setTimerSeconds] = useState();
    const [countIsLive, setcountIsLive] = useState(true);

    let interval;

    const startTimer = () => {
        const countDownDate = new Date(Date.UTC(2021, 6, 17, 4, 0, 0, 0)).getTime();//Jully 17, 2021 00:00:00

        interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = countDownDate - now;
            const days = Math.floor(distance / (24 * 60 * 60 * 1000));
            const hours = Math.floor((distance % (24 * 60 * 60 * 1000)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (60 * 60 * 1000)) / (1000 * 60));
            const seconds = Math.floor((distance % (60 * 1000)) / 1000);

            if (distance < 0) {
                // Stop Timer
                setcountIsLive(false);
                clearInterval(interval);
            } 
            else {
                // Update Timer
                setTimerDays(days);
                setTimerHours(hours);
                setTimerMinutes(minutes);
                setTimerSeconds(seconds);
            }
        });
    };

    useEffect(() => {
        startTimer();
    });

    const connectToMetaMask = async e => {
        e.preventDefault();
        try {
            const { moth } = await getBlockchain();
            setMoth(moth);

            let provider = await detectEthereumProvider();
            await provider.request({ method: 'eth_requestAccounts' });
            provider = new ethers.providers.Web3Provider(provider);
            const signer = provider.getSigner();
            setUser(signer);
            
            const mothMaster = await moth.mothMasterBal();
            const userBal = await moth.balanceOf(signer.getAddress());
            const lastClaim = await moth.lastClaimOf(signer.getAddress());
            
            setMothMaster(mothMaster.toString());
            setUserBal(userBal.toString());
            setLastClaim(lastClaim.toString());
        } catch (e) {
            alert('Make sure you are trying to connect to the bsc smart chain (other chains wont work)');
        }
        
    };

    const claimReward = async e => {
        e.preventDefault();
        try {
            const tx = await moth.getReward();
            await tx.wait();
        } catch (e) {
            alert('You can only claim once every 24h if you have 100 moths');
        }
        

        const newMothMaster = await moth.mothMasterBal();
        const userBal = await moth.balanceOf(user.getAddress());
        const lastClaim = await moth.lastClaimOf(user.getAddress());
        
        setMothMaster(newMothMaster.toString());
        setUserBal(userBal.toString());
        setLastClaim(lastClaim.toString());
    };

    return (
        <>
            {countIsLive ? 
                <SideBarCount 
                    isOpen={isOpen} 
                    toggle={toggle} 
                />  : 
                <SideBarLive 
                    isOpen={isOpen} 
                    toggle={toggle} 
                    claimReward={claimReward}
                    countIsLive={countIsLive}
                />
            }
          

            {countIsLive ? 
                <NavBarCount
                    toggle={toggle} 
                /> :
                <NavBarLive 
                    toggle={toggle} 
                    claimReward={claimReward} 
                    connectToMetaMask={connectToMetaMask}
                    moth={moth}
                />
            }

            <HeroSectionLive 
                mothMaster={mothMaster}
            />

            <LogoSection />
          
            {countIsLive ? 
                <AboutSectionCount />:
                <AboutSectionLive />
            }
            
            {countIsLive ?
                <></> :
                <MothSection 
                    moth={moth} 
                    mothMaster={mothMaster}
                    claimReward={claimReward} 
                    connectToMetaMask={connectToMetaMask}
                    userBal={userBal}
                    lastClaim={lastClaim}
                />
            }

            <WhitepaperSection />

            <DiscoverSection />

            <CreatorSection />

            <LogoSection />
            
            <Footer />
        </>
    )
};
export default Home
