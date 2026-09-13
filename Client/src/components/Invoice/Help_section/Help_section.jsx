import React from 'react'

const Help_section = (props) => {
  return (
    <div className='fixed inset-0 z-50 flex justify-center items-center'>
        <div className='absolute inset-0 bg-black/40'></div>
        <div className='relative z-10 h-[85vh] w-[90vw] max-w-5xl justify-around p-4 flex flex-col rounded-2xl bg-[#2C2C2A]/95 overflow-y-auto'>
            <div className='w-full  h-fit flex justify-between'>
                <div className='text-amber-50 font-semibold text-2xl '>Help</div>
                <div onClick={props.close} className='cursor-pointer self-end w-10 h-10 bg-[url("/close_otp_box.png")] bg-contain bg-no-repeat'></div>
            </div>
            <div className='w-full flex flex-col gap-6 text-gray-300'>
                <span className='text-2xl text-amber-50 font-extrabold underline underline-offset-4 decoration-2'>Invoices</span>
                <div className='h-fit w-full flex flex-col gap-2'>
                    <span className='text-xl text-amber-50 font-bold'>What this is for:</span>
                    <span className='text-xl'>Track every bill you send to clients — whether it's for a specific project or a standalone retainer — and see who owes you money and who's late.</span>
                </div>

                <div className='h-fit w-full flex flex-col gap-2'>
                    <span className='text-xl text-amber-50 font-extrabold'>Creating an invoice</span>
                    <span className='text-xl'>Click + New Invoice, pick a client, and optionally link it to one of their projects (leave it as "Standalone" for retainers or work not tied to a project).</span>
                    <span className='text-xl'>Add one or more line items — each with a description, quantity, and rate. Your total is calculated automatically as you type, so you can bill for multiple things (e.g. design + revisions) on one invoice instead of a single flat number.</span>
                    <span className='text-xl'>You can save it as a Draft to finish later, or Create & Send to mark it sent right away.</span>
                </div>

                <div className='h-fit w-full flex flex-col gap-2'>
                    <span className='text-xl text-amber-50 font-extrabold'>The stats at the top</span>
                    <ul className='list-disc pl-6 flex flex-col gap-2 text-xl'>
                        <li><span className='font-semibold text-amber-50'>Paid</span> — total value of everything marked Paid.</li>
                        <li><span className='font-semibold text-amber-50'>Outstanding</span> — everything still owed to you (Sent + Overdue combined).</li>
                        <li><span className='font-semibold text-amber-50'>Overdue</span> — how many invoices, and how much money, is past due.</li>
                        <li><span className='font-semibold text-amber-50'>Drafts</span> — invoices you've started but haven't sent yet.</li>
                    </ul>
                </div>

                <div className='h-fit w-full flex flex-col gap-2'>
                    <span className='text-xl text-amber-50 font-extrabold'>Total vs. Budget — these are different</span>
                    <span className='text-xl'>An invoice's <span className='font-semibold text-amber-50'>Total</span> is what that specific bill is worth. A project's <span className='font-semibold text-amber-50'>Budget</span> (seen on the Projects page) is the whole project's planned cost — one project can be billed across several invoices over time, each with its own smaller total.</span>
                </div>

                <div className='h-fit w-full flex flex-col gap-2'>
                    <span className='text-xl text-amber-50 font-extrabold'>Filtering</span>
                    <span className='text-xl'>Use the status and client dropdowns above the list to narrow down invoices — e.g. filter by <span className='font-semibold text-amber-50'>Overdue</span> to instantly see who's late on payment.</span>
                </div>

                <img
                  src='/Invoice_icon/Screenshot%20From%202026-08-16%2017-48-51.png'
                  alt='Invoice help screenshot'
                  className='w-full h-auto rounded-xl object-contain'
                />


            </div>
        </div>
    </div>
  )
}

export default Help_section