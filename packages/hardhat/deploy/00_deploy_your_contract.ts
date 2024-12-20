import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployNotesContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying NotesContract...");

  await deploy("NotesContract", {
    from: deployer,
    args: [], // No constructor arguments
    log: true,
  });

  console.log("NotesContract deployed!");
};

export default deployNotesContract;
deployNotesContract.tags = ["NotesContract"];