import MultisigTreasury from '@/components/MultisigTreasury';
import NavigationBar from '@/components/NavigationBar';

const Treasury = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <MultisigTreasury />
    </div>
  );
};

export default Treasury;

