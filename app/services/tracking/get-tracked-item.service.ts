import TrackingModel from '~/models/trackings';

export const getTrackedItem = async (id: string) => {
  return TrackingModel.findById(id);
};
