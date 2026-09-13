import React from 'react'

const Description = (props) => {
  return (
    <div className='w-full h-fit flex flex-col gap-2'>
                <div className='w-full h-fit grid grid-cols-5 gap-2'>
          <input
            onChange={(e) => props.changeinput(props.id, 'description', e.target.value)}
            value={props.item?.description || ''}
            type="text"
            placeholder='Item Description'
            className='w-full col-span-2 h-12 bg-[rgb(61,60,57)] p-2 text-amber-50 text-xl rounded-xl '
          />
          <input
            onChange={(e) => props.changeinput(props.id, 'quantity', e.target.value)}
            value={props.item?.quantity || ''}
            type="number"
            min="0"
            placeholder='Qty'
            className='w-1/2 place-self-center p-2 rounded-xl h-12 bg-[#3d3c39] text-amber-50 text-xl'
          />
          <input
            onChange={(e) => props.changeinput(props.id, 'rate', e.target.value)}
            value={props.item?.rate || ''}
            type="number"
            min="0"
            placeholder='Rate'
            className='w-4/5 h-12 rounded-xl p-2 bg-[#3d3c39] text-amber-50 text-xl'
          />
                    <div className='w-full h-12 flex justify-center items-center gap-6'>
                      <input type="number" value={props.item?.amount || 0} min={0} readOnly className='w-4/5 h-12 rounded-xl p-2  text-amber-50 text-xl'/>
            <span onClick={() => props.delete(props.id)} className='w-5 h-5 cursor-pointer bg-[url("/delete.png")] bg-contain bg-no-repeat'></span>
                    </div>
                </div>
            </div>
  )
}

export default Description