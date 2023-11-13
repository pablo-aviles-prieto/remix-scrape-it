import { Heading } from 'evergreen-ui';
import { TablePricingHistory } from '../styles/table-pricing-history';
import type { TrackingResponse } from '~/interfaces/tracking-schema';

type Props = {
  item: TrackingResponse;
};

export const PriceHistory = ({ item }: Props) => {
  return (
    <div>
      <Heading color='muted' className='text-center !mb-1' size={600}>
        Histórico de precios
      </Heading>
      <div className='pr-[1rem] max-w-3xl mx-auto border h-[calc(100vh-600px)] overflow-y-auto border-slate-800 rounded-lg'>
        <TablePricingHistory item={item} />
      </div>
    </div>
  );
};
