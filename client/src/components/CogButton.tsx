interface CogButtonProps {
onClick: () => void;
text: string;
underline?: boolean;
}

const CogButton = ({onClick ,text, underline=true} : CogButtonProps) => {
  return (
    <button onClick={onClick} className={`${underline ? 'hover:underline' : ''} hover:cursor-pointer`}>
      {text}
    </button>
  )
}

export default CogButton