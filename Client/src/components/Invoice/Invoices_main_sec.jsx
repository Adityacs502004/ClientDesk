import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router';
import Api from '../../Service/api';
import Card from '../Project/Card/Card'
import Filter from '../Project/Filter/Filter';
import Invoice_details from './Invoice_details/Invoice_details';
import Help_section from './Help_section/Help_section';
import Invoice_popup from './Invoice_popup/Invoice_popup';

const normalizeAmount = (value) => {
  const numericValue = Number(value || 0);
  return Object.is(numericValue, -0) ? 0 : numericValue;
};

const sumAmounts = (rows = []) => {
  return rows.reduce((sum, row) => sum + Number(row?.amount || 0), 0);
};

const Invoices_main_sec = () => {
  const navigate = useNavigate();

  const [clientname, Setclient] = useState([]);
  const [clientnameid, Setnameid] = useState([]);
  const [payment_status, Setstatus] = useState('All');
  const payment_options = ['All', 'Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'];
  const client_options = ['All', ...clientname];
  const [selected_client, Setselected_client] = useState('All');
  const [open_help, Sethelp] = useState(false);
  const [invoice_popup, Setinvoicepopup] = useState(false);
  const [invoice_data, Setinvoicedata] = useState([]);
  const [overdue_id, Setoverdue_id] = useState([]);

  const [draft_length, Setdraft_length] = useState(0);
  const [sent_id, Setsent_id] = useState([]);
  const [paid_id, Setpaid_id] = useState([]);

  const [paid_amount, Setpaidamount] = useState(0);
  const [sent_amount, Setsentamount] = useState(0);
  const [overdue_amount, Setoverdueamount] = useState(0);

  const [search_text , Setsearchtext] = useState("");

  useEffect(() => {
    async function get_client() {
      try {
        const get_client = await Api.get('/invoice/get_client');
        const clients = (get_client?.data?.data ?? []).filter(Boolean);
        const names = clients.map((name) => name.client_name).filter(Boolean);
        Setclient([...names]);
        Setnameid([...clients]);
      } catch (error) {
        console.log('Error getting client name', error);
      }
    }

    get_client();
    get_invoices();
  }, []);

  async function get_invoices() {
    try {
      const get_invoice = await Api.get('/invoice/get_invoice');
      const invoice_list = get_invoice?.data?.invoice_data ?? [];
      Setinvoicedata(invoice_list.filter(Boolean));
    } catch (error) {
      console.log('Error getting invoice data');
    }
  }

  function handle_search_input(e){
    Setsearchtext(e.target.value);
  }

  function open_help_section() {
    Sethelp((prev) => !prev);
  }

  function open_invoice_popup() {
    Setinvoicepopup((prev) => !prev);
  }

  useEffect(() => {
    if (!invoice_data.length) {
      Setoverdue_id([]);
      Setdraft_length(0);
      Setpaidamount(0);
      Setsentamount(0);
      Setoverdueamount(0);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue_ids = invoice_data
      .filter((invoice) => {
        if (!invoice?.due_date) return false;
        if (invoice?.status === 'Paid' || invoice?.status === 'Cancelled') return false;

        const [day, month, year] = invoice.due_date.split('-');
        const dueDate = new Date(`${year}-${month}-${day}`);
        dueDate.setHours(0, 0, 0, 0);

        return today > dueDate;
      })
      .map((invoice) => invoice.id);

    const overdue_id_set = new Set(overdue_ids);

    const draft = invoice_data.filter((item) => item?.status === 'Draft').length;
    const sent_ids = invoice_data
      .filter((item) => item?.status === 'Sent' && !overdue_id_set.has(item.id))
      .map((item) => item?.id);
    const paid_ids = invoice_data.filter((item) => item?.status === 'Paid').map((item) => item?.id);

    Setdraft_length(draft);
    Setsent_id(sent_ids);
    Setpaid_id(paid_ids);
    Setoverdue_id(overdue_ids);

    async function get_amount() {
      try {
        const get_amount = await Api.post('/invoice/get_amount_by_status', {
          paid_ids,
          sent_ids,
          overdue_ids,
        });

        const response = get_amount?.data || {};
        const paid_total = normalizeAmount(
          typeof response?.paid_amount === 'number'
            ? response.paid_amount
            : sumAmounts(response?.paid_amount || [])
        );
        const sent_total = normalizeAmount(
          typeof response?.sent_amount === 'number'
            ? response.sent_amount
            : sumAmounts(response?.sent_amount || [])
        );
        const overdue_total = normalizeAmount(
          typeof response?.overdue_amount === 'number'
            ? response.overdue_amount
            : sumAmounts(response?.overdue_amount || [])
        );

        Setpaidamount(paid_total);
        Setsentamount(sent_total);
        Setoverdueamount(overdue_total);
      } catch (error) {
        console.log('Error getting payment amount');
      }
    }

    get_amount();
  }, [invoice_data]);

  const overdue_number = overdue_id.length;
  const outstanding_amount = normalizeAmount(sent_amount + overdue_amount);

  const filter_and_search = [...invoice_data].filter((item)=>{
    const search = (search_text.trim()).toLocaleLowerCase();

    const client_name = String(item?.client_name || '').toLocaleLowerCase();
    const project_name = String(item?.project_name || '').toLocaleLowerCase();
    const match_input =  !search || client_name.includes(search) || project_name.includes(search);

    const filter_client = selected_client == 'All' || selected_client == item?.client_name;

    let actual_status = item?.status;

    if (item?.status == 'Sent' && item?.due_date){
        const current_date = new Date();
        current_date.setHours(0 , 0 , 0 , 0);

        const [day, month, year] = item.due_date.split('-');
        const dueDate = new Date(`${year}-${month}-${day}`);
        dueDate.setHours(0, 0, 0, 0);

        if(current_date > dueDate){
            actual_status = 'Overdue'
        }
    }

    const filter_status = payment_status === 'All' || payment_status === actual_status;

    return match_input  && filter_status && filter_client
  });

  return (
    <div className='min-w-4/5 h-full p-4 flex flex-col gap-y-8 bg-[#0E1016]'>
      <div className='flex justify-between'>
        <div className='flex flex-col'>
          <span className='text-2xl text-gray-300'>Invoices</span>
          <span className='text-lg text-gray-300'>Bill clients for project work or standalone retainers, and track who still owes you.</span>
        </div>
        <div onClick={open_invoice_popup} className='h-13 w-40 bg-[#25ab25] hover:bg-[#119317] hover:scale-95 rounded-xl cursor-pointer flex justify-around items-center'>
          <div className='text-4xl text-amber-50'>+</div>
          <div className='text-xl text-amber-50'>Add Invoice</div>
        </div>
      </div>

      <div className='w-full h-fit flex justify-around'>
        <Card title={'Paid'} data={paid_amount} color={'text-[#00A36C]'}/>
        <Card title={'Outstanding'} data={outstanding_amount} color={'text-[#0096FF]'} footer={'Sent + overdue'} />
        <Card title={'Overdue'} data={overdue_number} color={'text-[#FC1010]'} footer={`₹ ${overdue_amount}`}/>
        <Card title={'Drafts'} data={draft_length} color={'text-[#FFFFFF]'} />
      </div>

      <div className='w-full h-12 flex gap-12 justify-around'>
        <input onChange={handle_search_input} value={search_text} className='h-full w-1/4 text-amber-50 p-2 flex-1 bg-[#35394C] rounded-xl' type='text' placeholder='🔍︎   Search projects ... ' />
        <Filter options={payment_options} width={'w-1/8'} selected={payment_status} on_select={Setstatus} />
        <Filter options={client_options} width={'w-1/6'} selected={selected_client} on_select={Setselected_client} />
      </div>

      <div onClick={open_help_section} className='h-7 w-fit border-2 border-amber-50 pl-2 pr-2 rounded-xl cursor-pointer self-end-safe flex justify-center items-center gap-2 mr-8'>
        <div className='h-full w-5 justify-self-center bg-[url("/Invoice_icon/help.png")] bg-contain bg-no-repeat '></div>
        <span className='text-lg text-gray-300'>help</span>
      </div>

      <div className='w-full h-auto rounded-xl p-2'>
        <div className='w-full h-12 items-center text-amber-50 bg-[#33373c] text-lg grid grid-cols-6 rounded-xl place-items-center'>
          <span>Invoice</span>
          <span>Client / Project</span>
          <span>Total</span>
          <span>Issued</span>
          <span>Due</span>
          <span>Status</span>
        </div>
        {filter_and_search.length > 0 ? (
          filter_and_search.map((invoice) => (
            <Invoice_details
              key={invoice.id}
              onClick={() => navigate('/invoice/action', { state: { invoice } })}
              invoice={invoice}
            />
          ))
        ) : (
          <div className='w-full py-8 text-center text-gray-400'>No invoices yet</div>
        )}
      </div>

      {open_help ? <Help_section close={open_help_section} /> : null}
      {invoice_popup ? <Invoice_popup clients={clientnameid} close={open_invoice_popup} saved={get_invoices} /> : null}
    </div>
  )
}

export default Invoices_main_sec
