import { Button } from "./Button";
import { Link } from "react-router-dom";

const GetNums = ({ ...props }) => {
  return (
    <Button bg="green.100" {...props}>
      <Link
        to="https://app.ekubo.org/?amount=-10000&outputCurrency=NUMS&inputCurrency=USDC"
        target="_blank"
      >
        Get Nums
      </Link>
    </Button>
  );
};
export default GetNums;
