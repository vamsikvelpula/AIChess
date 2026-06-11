export default function MoveHistory({ moves }) {
  const rows = [];
  for (let i = 0; i < moves.length; i += 2) {
    rows.push({ no: i / 2 + 1, white: moves[i], black: moves[i + 1] });
  }

  return (
    <div className="card move-history">
      <h2 className="section-title">Moves</h2>
      {rows.length === 0 ? (
        <p className="text-muted">No moves yet.</p>
      ) : (
        <table>
          <tbody>
            {rows.map((row) => (
              <tr key={row.no}>
                <td>{row.no}.</td>
                <td>{row.white}</td>
                <td>{row.black ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
