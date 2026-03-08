const Card = ({ className = '', children }) => (
  <div className={['rounded-lg p-4 glass', className].join(' ')}>
    {children}
  </div>
);

export default Card;
