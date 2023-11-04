import TrackingModel from '~/models/trackings';

export const getAllTrackedItems = async () => {
  return TrackingModel.find({});
};
