class CgNode < Formula
  desc "node.js dependency for CloudGraph"
  homepage "https://cloudgraph.dev"
  url "__NODE_BIN_URL__"
  version "__NODE_VERSION__"
  sha256 "__NODE_SHA256__"
  keg_only "cg-node is only used by CloudGraph CLI (cloudgraphdev/tap/cli), which explicitly requires from Cellar"

  def install
    bin.install buildpath/"bin/node"
  end

  def test
    output = system bin/"node", "version"
    assert output.strip == "v#{version}"
  end
end