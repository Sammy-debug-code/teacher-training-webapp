import Lockup from "./Lockup";

export default function AppBar({ right }: { right?: React.ReactNode }) {
  return (
    <header className="on-plum sticky top-0 z-20 bg-plum text-white">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
        <Lockup compact />
        {right}
      </div>
    </header>
  );
}
