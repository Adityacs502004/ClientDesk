import React from 'react'

const Invoice_details = (props) => {

  const status_bg_color = {'Draft' : '#2A2A2A' , 'Sent' : '#3573b8' , 'Paid' : '#173F3B' , 'Overdue' : '#4A2318' , 'Cancelled' : '#2F2C2D'};
  const status_icon = {'Draft' : '/Invoice_icon/draft.png' , 'Sent' : '/Invoice_icon/paper-plane-solid-full.svg' , 'Paid' : '/Invoice_icon/accept.png' , 'Overdue' : '/Invoice_icon/overdue.png' , 'Cancelled' : '/Invoice_icon/ban-solid-full.svg'};
  const invoice = props.invoice ?? {};

  const getDisplayStatus = () => {
    const baseStatus = invoice.status ?? 'Draft';

    if (baseStatus === 'Cancelled' || baseStatus === 'Paid') {
      return baseStatus;
    }

    if (!invoice?.due_date) {
      return baseStatus;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [day, month, year] = invoice.due_date.split('-');
    const dueDate = new Date(`${year}-${month}-${day}`);
    dueDate.setHours(0, 0, 0, 0);

    if (today > dueDate) {
      return 'Overdue';
    }

    return baseStatus;
  };

  const status = getDisplayStatus();

  return (
    <div onClick={props.onClick} className="w-full min-h-18 cursor-pointer h-fit border-b-2 border-b-gray-800 flex items-stretch">
       <div className='w-full h-full min-h-18 grid grid-cols-6 place-items-center '>
           {/* invoice number */}
           <div className='w-full h-full items-center justify-center flex flex-col'>
              <span className='text-amber-50 text-xl font-bold'>{invoice.invoice_number || '-'}</span>
           </div>
           {/* project and client name */}
           <div className='w-full h-full flex flex-col items-center justify-center'>
              <span className='text-amber-50 text-xl font-bold'>{invoice.client_name || '-'}</span>
              <span className='text-gray-400 text-md font-bold'>{invoice.project_name || '-'}</span>
            </div>
            {/* Invoice sum */}
            <div className='w-full h-full flex gap-2 justify-center items-center'>
              <span className='text-gray-300 text-xl font-bold'>₹</span>
              <span className='text-gray-300 text-xl font-bold'>{invoice.total_amount ?? 0}</span>
            </div>
            {/* Invoice issue date */}
            <div className='w-full h-full flex gap-2 justify-center items-center'>
              <span className='text-gray-200 text-xl font-bold'>{invoice.issue_date || '-'}</span>
            </div>
            {/* Invoice due date */}
            <div className='w-full h-full flex gap-2 justify-center items-center'>
              <span className='text-gray-200 text-xl font-bold'>{invoice.due_date || '-'}</span>
            </div>
            {/* Status */}
            <div className='w-full h-full min-h-18 gap-2 flex flex-col justify-center items-center'>
                <div name={status} className={`w-fit h-fit p-2 pl-2 justify-center items-center flex gap-1 pr-2 rounded-xl`} style={{ backgroundColor: status_bg_color[status] || '#2A2B2D' }}>
                  {status_icon[status] ? (
                    <img src={status_icon[status]} alt={`${status} status`} className='h-4 w-4 object-contain' />
                  ) : null}
                    <span className='text-md text-gray-400'>{status}</span>
                </div>
            </div>
       </div>
    </div>
  )
}

export default Invoice_details