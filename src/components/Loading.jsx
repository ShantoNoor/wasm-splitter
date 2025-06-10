const Loading = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-[30vh] font-bold gap-2">
      Loading... Please wait!
      <div className="size-16 border-4 border-dashed rounded-full animate-spin border-primary">
    </div>
    </div>
  );
};

export default Loading;
