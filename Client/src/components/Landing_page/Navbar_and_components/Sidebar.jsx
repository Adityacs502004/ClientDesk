import React from 'react'

const Sidebar = () => {
    const [isOpen , changeState] = useState(false);

    function HandleMenuClick() {  
        changeState((prev) => !prev);
        console.log(isOpen);   
    }

    function Sidebar() {
        if (isOpen){
            return (
                <div className='flex right-0 w-3/4 h-dvh bg-linear-to-b absolute from-gray-800 to-gray-600'>
                    <div className='ml-auto w-full'>
                        <img onClick={HandleMenuClick} src="/close.png" alt='close' className='h-8 ml-auto mr-6 mt-6 w-8 mt-4 '></img>
                    </div>
                </div>
            )
        }
    }

  return (
    <Sidebar />
  )
}

export default Sidebar


 
