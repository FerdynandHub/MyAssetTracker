export default function ModeSelection({
  userName,
  userRole,
  roles,
  ModeCard,
  setMode,
  onLogout,
}) {
  return (
    <div className="min-h-[100vh] bg-gray-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome to Portal AVM!
              </h1>
              <p className="text-gray-600">Select a mode to begin</p>
              <p className="text-sm text-gray-500 mt-2">
                Logged in as: {userName} ({userRole})
              </p>
            </div>

            <button
              onClick={onLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Keluar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ModeCard
            title="Overview"
            description="Lihat semua aset dari kategori"
            onClick={() => setMode("overview")}
            color="blue"
          />

          <ModeCard
            title="Check Information"
            description="Scan atau search detail aset"
            onClick={() => setMode("check")}
            color="green"
          />

          <ModeCard
            title="Export"
            description="Batch scan dan export ke sheet"
            onClick={() => setMode("export")}
            color="purple"
          />

          <ModeCard
            title="History"
            description="Lihat pergerakan dari aset"
            onClick={() => setMode("history")}
            color="indigo"
          />

          <ModeCard
            title={userRole === roles.ADMIN ? "Update Information" : "Request Update"}
            description={
              userRole !== roles.VIEWER
                ? userRole === roles.ADMIN
                  ? "Update asset information"
                  : "Request asset updates (requires approval)"
                : "Access: Editor and Admin"
            }
            onClick={userRole !== roles.VIEWER ? () => setMode("update") : undefined}
            color="orange"
            disabled={userRole === roles.VIEWER}
          />

          <ModeCard
            title="Pending Approvals"
            description={
              userRole === roles.ADMIN
                ? "Review and approve update requests"
                : "Access: Admin"
            }
            onClick={userRole === roles.ADMIN ? () => setMode("approvals") : undefined}
            color="red"
            disabled={userRole !== roles.ADMIN}
          />

          <ModeCard
            title="Knowledge Base"
            description={
              userRole !== roles.VIEWER
                ? "Access Knowledge Base"
                : "Access restricted"
            }
            onClick={
              userRole !== roles.VIEWER
                ? () =>
                    window.open(
                      "https://docs.google.com/document/d/1nQZMGHu7H5A4cRY08elEqtDZfLe-NB-ySr3_jbc3Nbs/edit?tab=t.ajkay86zze5j",
                      "_blank"
                    )
                : undefined
            }
            disabled={userRole === roles.VIEWER}
            color="blue"
          />


          {/* coming soon */}
          {[
            "Single-Use Item",
            "Request barang",
            "Progressions",
          ].map((title) => (
            <ModeCard
              key={title}
              title={title}
              description="[Coming Soon]"
              onClick={() =>
                window.open(
                  "https://i.pinimg.com/originals/e2/3a/ae/e23aaef101758ba2d6e06b67597b3377.jpg",
                  "_blank"
                )
              }
              color="gray"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
